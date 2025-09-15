<?php
// backend/api.php
// MyKids API v3 - Router + Handlers (use config.php for DB/CORS/helpers)

require_once __DIR__ . '/config.php';

// ----------- CORS / Preflight -----------
setCorsHeaders(); // will exit() on OPTIONS

// ----------- Utils -----------
function parseRequest(): array {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $query  = $_SERVER['QUERY_STRING'] ?? '';
    parse_str($query, $params);

    $endpoint = null; $id = null;
    foreach ([
        'families','children','behaviors','good-behaviors','bad-behaviors',
        'rewards','activities','daily-activities','auth','health'
    ] as $ep) {
        if (array_key_exists($ep, $params)) {
            $endpoint = $ep;
            $id = ($params[$ep] !== '') ? $params[$ep] : null;
            break;
        }
    }
    return [$method, $endpoint, $id, $params];
}

function getJsonBody(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// ----------- Handlers -----------

// Health: ไม่พึ่ง DB (แต่ลองเช็คสถานะ DB แบบ soft)
function handleHealth(): void {
    $dbStatus = 'unknown';
    try {
        $pdo = @getDbConnection();
        if ($pdo instanceof PDO) $dbStatus = 'up';
    } catch (Throwable $e) {
        $dbStatus = 'down';
    }
    sendJson([
        'ok'       => true,
        'name'     => API_NAME,
        'version'  => API_VERSION,
        'time'     => date('c'),
        'db'       => $dbStatus,
    ], 200);
}

// Auth: POST /auth?login  { FamilyId, Password }
function handleAuth(PDO $pdo, string $method, array $params): void {
    if ($method !== 'POST' || !isset($params['login'])) {
        sendJson(['error' => 'Invalid auth endpoint'], 400);
    }

    $body = getJsonBody();
    $familyId = trim($body['FamilyId'] ?? '');
    $password = (string)($body['Password'] ?? '');

    if ($familyId === '') {
        sendJson(['error' => 'FamilyId is required'], 400);
    }

    $stmt = $pdo->prepare("SELECT Id, Name, Password, Email, Phone, AvatarPath, IsActive 
                             FROM Families WHERE Id = ? LIMIT 1");
    $stmt->execute([$familyId]);
    $row = $stmt->fetch();

    if (!$row) {
        sendJson(['error' => 'Family not found'], 404);
    }
    if ((int)$row['IsActive'] !== 1) {
        sendJson(['error' => 'Family is inactive'], 403);
    }

    $hash = (string)$row['Password'];
    $passOk = false;
    // รองรับทั้ง bcrypt และกรณีรหัสว่าง
    if ($hash === '' && $password === '') {
        $passOk = true;
    } elseif (preg_match('/^\$2y\$/', $hash)) {
        $passOk = password_verify($password, $hash);
    } else {
        // ถ้าเก็บเป็น plain (ไม่แนะนำ) ก็เทียบตรง ๆ
        $passOk = hash_equals($hash, $password);
    }

    if (!$passOk) {
        sendJson(['error' => 'Invalid password'], 401);
    }

    // (ตัวอย่าง) payload ตอบกลับ
    sendJson([
        'family' => [
            'Id'    => $row['Id'],
            'Name'  => $row['Name'],
            'Email' => $row['Email'],
            'Phone' => $row['Phone'],
            'AvatarPath' => $row['AvatarPath'],
        ],
        'token' => base64_encode($row['Id'] . '|' . time()), // placeholder token
    ]);
}

// Families: GET /families  |  GET /families=F001
function handleFamilies(PDO $pdo, string $method, ?string $id): void {
    if ($method === 'GET') {
        if ($id) {
            $stmt = $pdo->prepare("
                SELECT f.*, COUNT(c.Id) AS childrenCount
                  FROM Families f
                  LEFT JOIN Children c
                        ON c.FamilyId = f.Id AND c.IsActive = 1
                 WHERE f.Id = ? AND f.IsActive = 1
                 GROUP BY f.Id
            ");
            $stmt->execute([$id]);
            $family = $stmt->fetch();
            if (!$family) sendJson(['error' => 'Family not found'], 404);

            // children รายคน + คะแนนปัจจุบัน
            $stmt = $pdo->prepare("
                SELECT c.*,
                       COALESCE(SUM(da.EarnedPoints),0) AS currentPoints
                  FROM Children c
                  LEFT JOIN DailyActivity da
                         ON da.ChildId = c.Id AND da.Status = 'Approved'
                 WHERE c.FamilyId = ?
                 GROUP BY c.Id
                 ORDER BY c.Name
            ");
            $stmt->execute([$id]);
            $children = $stmt->fetchAll();

            sendJson(['family' => $family, 'children' => $children]);
        } else {
            $stmt = $pdo->query("
                SELECT f.*, 
                       (SELECT COUNT(1) FROM Children c 
                         WHERE c.FamilyId = f.Id AND c.IsActive = 1) AS childrenCount
                  FROM Families f
                 WHERE f.IsActive = 1
                 ORDER BY f.CreatedAt DESC, f.Id
            ");
            sendJson($stmt->fetchAll());
        }
    } elseif ($method === 'POST') {
        // Families: POST /families { Id?, Name, Password, Email, Phone, AvatarPath }
        $b = getJsonBody();
        $name  = trim($b['Name'] ?? '');
        $pass  = trim($b['Password'] ?? '');
        $email = trim($b['Email'] ?? '');
        $phone = trim($b['Phone'] ?? '');
        $avatar= trim($b['AvatarPath'] ?? '');

        if ($name === '' || $pass === '') {
            sendJson(['error' => 'Missing required: Name, Password'], 400);
        }

        $id = 'F' . str_pad((string)random_int(1,999),3,'0',STR_PAD_LEFT);
        $hash = password_hash($pass, PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("
            INSERT INTO Families (Id, Name, Password, Email, Phone, AvatarPath, CreatedAt, IsActive)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), 1)
        ");
        $stmt->execute([$id, $name, $hash, $email, $phone, $avatar ?: '👨‍👩‍👧‍👦']);

        sendJson(['id'=>$id,'message'=>'Family registered']);
    } else {
        sendJson(['error' => 'Method not allowed'], 405);
    }
}

// Children: 
// GET /children
// GET /children=C001
// GET /children?familyId=F001
// POST /children  { Name, Age, FamilyId, [AvatarPath] }
function handleChildren(PDO $pdo, string $method, ?string $id, array $params): void {
    switch ($method) {
        case 'GET':
            $familyId = $params['familyId'] ?? null;
            $sql = "SELECT * FROM Children WHERE 1=1";
            $bind = [];

            if ($id)      { $sql .= " AND Id = ?";        $bind[] = $id; }
            if ($familyId){ $sql .= " AND FamilyId = ?";  $bind[] = $familyId; }
            $sql .= " AND IsActive = 1 ORDER BY Name";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($bind);
            $rows = $stmt->fetchAll();
            if ($id && !$rows) sendJson(['error' => 'Child not found'], 404);
            sendJson($rows);
        case 'POST':
            $b = getJsonBody();
            $name     = trim($b['Name'] ?? '');
            $age      = isset($b['Age']) ? (int)$b['Age'] : null;
            $familyId = trim($b['FamilyId'] ?? '');
            $avatar   = trim($b['AvatarPath'] ?? '');

            if ($name === '' || $familyId === '' || $age === null) {
                sendJson(['error' => 'Missing required: Name, Age, FamilyId'], 400);
            }

            $newId = 'C' . str_pad((string)random_int(1, 999), 3, '0', STR_PAD_LEFT);
            $stmt = $pdo->prepare("
                INSERT INTO Children (Id, FamilyId, Name, Age, AvatarPath, CreatedAt, IsActive)
                VALUES (?, ?, ?, ?, ?, NOW(), 1)
            ");
            $stmt->execute([$newId, $familyId, $name, $age, $avatar ?: '🧒']);
            sendJson(['id' => $newId, 'message' => 'Child created']);
        default:
            sendJson(['error' => 'Method not allowed'], 405);
    }
}

// Behaviors & Good/Bad filters:
// GET /behaviors [&familyId=F001]
// GET /good-behaviors
// GET /bad-behaviors
// POST /behaviors { Name, Points, FamilyId, Type(Good|Bad), [Color],[Category],[IsRepeatable] }
function handleBehaviors(PDO $pdo, string $method, string $endpoint, array $params): void {
    switch ($method) {
        case 'GET':
            $familyId = $params['familyId'] ?? null;
            $sql = "SELECT * FROM Behaviors WHERE IsActive = 1";
            $bind = [];

            if ($endpoint === 'good-behaviors') $sql .= " AND Type = 'Good'";
            if ($endpoint === 'bad-behaviors')  $sql .= " AND Type = 'Bad'";
            if ($familyId) { $sql .= " AND FamilyId = ?"; $bind[] = $familyId; }

            $sql .= " ORDER BY Category, Name";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($bind);
            sendJson($stmt->fetchAll());

        case 'POST':
            if ($endpoint !== 'behaviors') sendJson(['error' => 'POST not allowed here'], 405);
            $b = getJsonBody();
            $name = trim($b['Name'] ?? '');
            $pts  = isset($b['Points']) ? (int)$b['Points'] : null;
            $fam  = trim($b['FamilyId'] ?? '');
            $type = trim($b['Type'] ?? '');
            if ($name === '' || $pts === null || $fam === '' || !in_array($type, ['Good','Bad'], true)) {
                sendJson(['error' => 'Missing/invalid fields: Name, Points, FamilyId, Type(Good|Bad)'], 400);
            }

            $id = 'B' . str_pad((string)random_int(1, 999), 3, '0', STR_PAD_LEFT);
            $stmt = $pdo->prepare("
                INSERT INTO Behaviors (Id, FamilyId, Name, Points, Color, Category, Type, IsRepeatable, IsActive, CreatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
            ");
            $stmt->execute([
                $id, $fam, $name, $pts,
                $b['Color'] ?? '#FBBF24',
                $b['Category'] ?? 'ทั่วไป',
                $type,
                isset($b['IsRepeatable']) ? (int)$b['IsRepeatable'] : 0
            ]);
            sendJson(['id' => $id, 'message' => 'Behavior created']);

        default:
            sendJson(['error' => 'Method not allowed'], 405);
    }
}

// Rewards:
// GET /rewards [&familyId=F001]
// POST /rewards { Name, Cost, FamilyId, [Description],[Color],[Category],[ImagePath] }
function handleRewards(PDO $pdo, string $method, array $params): void {
    switch ($method) {
        case 'GET':
            $familyId = $params['familyId'] ?? null;
            $sql = "SELECT * FROM Rewards WHERE IsActive = 1";
            $bind = [];
            if ($familyId) { $sql .= " AND FamilyId = ?"; $bind[] = $familyId; }
            $sql .= " ORDER BY Cost ASC, Name";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($bind);
            sendJson($stmt->fetchAll());

        case 'POST':
            $b = getJsonBody();
            $name = trim($b['Name'] ?? '');
            $cost = isset($b['Cost']) ? (int)$b['Cost'] : null;
            $fam  = trim($b['FamilyId'] ?? '');
            if ($name === '' || $cost === null || $fam === '') {
                sendJson(['error' => 'Missing required: Name, Cost, FamilyId'], 400);
            }
            $id = 'R' . str_pad((string)random_int(1, 999), 3, '0', STR_PAD_LEFT);

            $stmt = $pdo->prepare("
                INSERT INTO Rewards (Id, FamilyId, Name, Description, Cost, Color, Category, ImagePath, CreatedAt, IsActive)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)
            ");
            $stmt->execute([
                $id, $fam, $name,
                $b['Description'] ?? '',
                $cost,
                $b['Color'] ?? '#FFE4E1',
                $b['Category'] ?? 'ทั่วไป',
                $b['ImagePath'] ?? '🎁'
            ]);
            sendJson(['id' => $id, 'message' => 'Reward created']);

        default:
            sendJson(['error' => 'Method not allowed'], 405);
    }
}

// Daily Activities (alias: activities)
// GET /daily-activities [&childId=C001][&date=YYYY-MM-DD][&familyId=F001]
// POST /daily-activities { ChildId, ActivityType(Good|Bad|Reward), ItemId, EarnedPoints, [Status] }
function handleDailyActivities(PDO $pdo, string $method, array $params): void {
    switch ($method) {
        case 'GET':
            $childId  = $params['childId']  ?? null;
            $date     = $params['date']     ?? date('Y-m-d');
            $familyId = $params['familyId'] ?? null;

            $sql = "
                SELECT da.*,
                       CASE WHEN da.ActivityType = 'Reward' THEN r.Name ELSE b.Name END AS ItemName,
                       CASE WHEN da.ActivityType = 'Reward' THEN r.Color ELSE b.Color END AS ItemColor,
                       c.Name AS ChildName
                  FROM DailyActivity da
             LEFT JOIN Behaviors b ON b.Id = da.ItemId AND da.ActivityType IN ('Good','Bad')
             LEFT JOIN Rewards   r ON r.Id = da.ItemId AND da.ActivityType = 'Reward'
             LEFT JOIN Children  c ON c.Id = da.ChildId
                 WHERE 1=1
            ";
            $bind = [];

            if ($childId)  { $sql .= " AND da.ChildId = ?";   $bind[] = $childId; }
            if ($date)     { $sql .= " AND da.ActivityDate = ?"; $bind[] = $date; }
            if ($familyId) { $sql .= " AND c.FamilyId = ?";   $bind[] = $familyId; }

            $sql .= " ORDER BY da.CreatedAt DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($bind);
            sendJson($stmt->fetchAll());

        case 'POST':
            $b = getJsonBody();
            $childId = trim($b['ChildId'] ?? '');
            $atype   = trim($b['ActivityType'] ?? '');
            $itemId  = trim($b['ItemId'] ?? '');
            $points  = isset($b['EarnedPoints']) ? (int)$b['EarnedPoints'] : null;
            $status  = trim($b['Status'] ?? 'Approved');

            if ($childId === '' || !in_array($atype, ['Good','Bad','Reward'], true) || $itemId === '' || $points === null) {
                sendJson(['error' => 'Missing/invalid: ChildId, ActivityType(Good|Bad|Reward), ItemId, EarnedPoints'], 400);
            }

            $stmt = $pdo->prepare("
                INSERT INTO DailyActivity (ChildId, ActivityType, ItemId, EarnedPoints, Status, ActivityDate, CreatedAt)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([$childId, $atype, $itemId, $points, $status, date('Y-m-d')]);
            sendJson(['message' => 'Activity recorded']);
        default:
            sendJson(['error' => 'Method not allowed'], 405);
    }
}

// ----------- Main Router -----------
try {
    [$method, $endpoint, $id, $params] = parseRequest();

    // alias
    if ($endpoint === 'activities') $endpoint = 'daily-activities';

    if ($endpoint === 'health') {
        handleHealth(); // no DB dependency
    }

    // connect DB for other endpoints
    $pdo = getDbConnection();

    switch ($endpoint) {
        case 'auth':
            handleAuth($pdo, $method, $params);
            break;

        case 'families':
            handleFamilies($pdo, $method, $id);
            break;

        case 'children':
            handleChildren($pdo, $method, $id, $params);
            break;

        case 'behaviors':
        case 'good-behaviors':
        case 'bad-behaviors':
            handleBehaviors($pdo, $method, $endpoint, $params);
            break;

        case 'rewards':
            handleRewards($pdo, $method, $params);
            break;

        case 'daily-activities':
            handleDailyActivities($pdo, $method, $params);
            break;

        default:
            sendJson(['error' => 'Endpoint not found'], 404);
    }
} catch (Throwable $e) {
    handleError($e->getMessage(), 500);
}
