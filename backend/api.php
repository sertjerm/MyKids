<?php
// api.php - Main API for MyKidsDB (MySQL Version)

require_once 'config.php';

setCorsHeaders();

try {
    // Parse request
    $method = $_SERVER['REQUEST_METHOD'];
    $requestUri = $_SERVER['REQUEST_URI'];
    $endpoint = null;
    $id = null;
    
    // Parse endpoint from query parameters (?children, ?behaviors, etc.)
    if (!empty($_GET)) {
        $queryKeys = array_keys($_GET);
        if (!empty($queryKeys)) {
            $endpoint = $queryKeys[0];
            $value = $_GET[$endpoint];
            $id = ($value !== '' && $value !== '1') ? $value : null;
        }
    }
    
    // Handle special query parameters
    $todayScore = isset($_GET['today-score']);
    $date = $_GET['date'] ?? date('Y-m-d');
    $childId = $_GET['childId'] ?? null;
    
    // Connect to database
    $pdo = getDbConnection();
    
    // Route to appropriate handler
    switch ($endpoint) {
        case 'children':
            handleChildren($pdo, $method, $id, $todayScore);
            break;
            
        case 'behaviors':
            handleBehaviors($pdo, $method, $id);
            break;
            
        case 'good-behaviors':
        case 'tasks':
            handleGoodBehaviors($pdo, $method);
            break;
            
        case 'bad-behaviors':
            handleBadBehaviors($pdo, $method);
            break;
            
        case 'rewards':
            handleRewards($pdo, $method, $id);
            break;
            
        case 'activities':
            handleActivities($pdo, $method);
            break;
            
        case 'daily':
            handleDaily($pdo, $method, $date, $childId);
            break;
            
        case 'dashboard':
            handleDashboard($pdo, $method);
            break;
            
        case 'behavior-summary':
            handleBehaviorSummary($pdo, $method);
            break;
            
        case 'today-summary':
            handleTodaySummary($pdo, $method, $date, $childId);
            break;
            
        case 'health':
            handleHealth($pdo);
            break;
            
        default:
            showApiInfo();
            break;
    }

} catch (Exception $e) {
    handleError($e->getMessage());
}

// === ENDPOINT HANDLERS ===

function handleChildren($pdo, $method, $id, $todayScore) {
    switch ($method) {
        case 'GET':
            if ($id) {
                if ($todayScore) {
                    getTodayScore($pdo, $id);
                } else {
                    getChildById($pdo, $id);
                }
            } else {
                getAllChildren($pdo);
            }
            break;
            
        case 'POST':
            createChild($pdo);
            break;
            
        default:
            sendJson(['error' => 'Method not allowed'], 405);
    }
}

function handleBehaviors($pdo, $method, $id) {
    switch ($method) {
        case 'GET':
            if ($id) {
                getBehaviorById($pdo, $id);
            } else {
                getAllBehaviors($pdo);
            }
            break;
            
        case 'POST':
            createBehavior($pdo);
            break;
            
        default:
            sendJson(['error' => 'Method not allowed'], 405);
    }
}

function handleGoodBehaviors($pdo, $method) {
    if ($method !== 'GET') {
        sendJson(['error' => 'Method not allowed'], 405);
    }
    
    $sql = "SELECT * FROM Behaviors WHERE Type = 'Good' AND IsActive = 1 ORDER BY Name";
    $stmt = $pdo->query($sql);
    $behaviors = $stmt->fetchAll();
    
    sendJson($behaviors);
}

function handleBadBehaviors($pdo, $method) {
    if ($method !== 'GET') {
        sendJson(['error' => 'Method not allowed'], 405);
    }
    
    $sql = "SELECT * FROM Behaviors WHERE Type = 'Bad' AND IsActive = 1 ORDER BY Name";
    $stmt = $pdo->query($sql);
    $behaviors = $stmt->fetchAll();
    
    sendJson($behaviors);
}

function handleRewards($pdo, $method, $id) {
    switch ($method) {
        case 'GET':
            if ($id) {
                getRewardById($pdo, $id);
            } else {
                getAllRewards($pdo);
            }
            break;
            
        case 'POST':
            createReward($pdo);
            break;
            
        default:
            sendJson(['error' => 'Method not allowed'], 405);
    }
}

function handleActivities($pdo, $method) {
    switch ($method) {
        case 'GET':
            getAllActivities($pdo);
            break;
            
        case 'POST':
            createActivity($pdo);
            break;
            
        default:
            sendJson(['error' => 'Method not allowed'], 405);
    }
}

function handleDaily($pdo, $method, $date, $childId) {
    if ($method !== 'GET') {
        sendJson(['error' => 'Method not allowed'], 405);
    }
    
    $sql = "SELECT * FROM DailyActivity WHERE 1=1";
    $params = [];
    
    if ($date && $date !== date('Y-m-d')) {
        $sql .= " AND ActivityDate = ?";
        $params[] = $date;
    }
    
    if ($childId) {
        $sql .= " AND ChildId = ?";
        $params[] = $childId;
    }
    
    $sql .= " ORDER BY ActivityDate DESC, CreatedAt DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $activities = $stmt->fetchAll();
    
    sendJson($activities);
}

function handleDashboard($pdo, $method) {
    if ($method !== 'GET') {
        sendJson(['error' => 'Method not allowed'], 405);
    }
    
    try {
        // Get children with scores
        $childrenSql = "SELECT * FROM vw_ChildrenScores ORDER BY Name";
        $children = $pdo->query($childrenSql)->fetchAll();
        
        // Get behavior summary
        $behaviorSql = "SELECT * FROM vw_BehaviorDailySummary ORDER BY Type DESC, Name";
        $behaviors = $pdo->query($behaviorSql)->fetchAll();
        
        // Get today's activities
        $todaySql = "SELECT * FROM DailyActivity WHERE ActivityDate = ? ORDER BY CreatedAt DESC";
        $todayActivities = $pdo->prepare($todaySql);
        $todayActivities->execute([date('Y-m-d')]);
        $todayData = $todayActivities->fetchAll();
        
        sendJson([
            'children' => $children,
            'behavior_summary' => $behaviors,
            'today_activities' => $todayData,
            'timestamp' => date('c'),
            'database_version' => 'MyKidsDB MySQL'
        ]);
        
    } catch (Exception $e) {
        sendJson(['error' => 'Dashboard query failed', 'message' => $e->getMessage()], 500);
    }
}

function handleBehaviorSummary($pdo, $method) {
    if ($method !== 'GET') {
        sendJson(['error' => 'Method not allowed'], 405);
    }
    
    $sql = "SELECT * FROM vw_BehaviorDailySummary ORDER BY Type DESC, Points DESC, Name";
    $stmt = $pdo->query($sql);
    $summary = $stmt->fetchAll();
    
    sendJson($summary);
}

function handleTodaySummary($pdo, $method, $date, $childId) {
    if ($method !== 'GET') {
        sendJson(['error' => 'Method not allowed'], 405);
    }
    
    $sql = "
        SELECT 
            ChildId,
            ActivityDate,
            ActivityType,
            SUM(Count) as TotalCount,
            SUM(EarnedPoints) as TotalPoints
        FROM DailyActivity 
        WHERE ActivityDate = ?
    ";
    
    $params = [$date];
    
    if ($childId) {
        $sql .= " AND ChildId = ?";
        $params[] = $childId;
    }
    
    $sql .= " GROUP BY ChildId, ActivityDate, ActivityType ORDER BY ChildId, ActivityType";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $summary = $stmt->fetchAll();
    
    sendJson($summary);
}

function handleHealth($pdo) {
    try {
        // Test database connection
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM Children");
        $result = $stmt->fetch();
        
        sendJson([
            'status' => 'OK',
            'timestamp' => date('c'),
            'database' => 'MyKidsDB MySQL Connected',
            'children_count' => $result['count'],
            'timezone' => date_default_timezone_get(),
            'php_version' => PHP_VERSION
        ]);
    } catch (Exception $e) {
        sendJson([
            'status' => 'ERROR',
            'message' => $e->getMessage(),
            'timestamp' => date('c')
        ], 500);
    }
}

// === CRUD FUNCTIONS ===

function getAllChildren($pdo) {
    $sql = "SELECT * FROM vw_ChildrenScores ORDER BY Name";
    $stmt = $pdo->query($sql);
    $children = $stmt->fetchAll();
    sendJson($children);
}

function getChildById($pdo, $id) {
    $sql = "SELECT * FROM vw_ChildrenScores WHERE Id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    $child = $stmt->fetch();
    
    if ($child) {
        sendJson($child);
    } else {
        sendJson(['error' => 'Child not found'], 404);
    }
}

function getTodayScore($pdo, $childId) {
    $sql = "
        SELECT 
            ChildId,
            SUM(EarnedPoints) as TodayPoints,
            COUNT(*) as TodayActivities
        FROM DailyActivity 
        WHERE ChildId = ? AND ActivityDate = ?
        GROUP BY ChildId
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$childId, date('Y-m-d')]);
    $score = $stmt->fetch();
    
    if (!$score) {
        $score = [
            'ChildId' => $childId,
            'TodayPoints' => 0,
            'TodayActivities' => 0
        ];
    }
    
    sendJson($score);
}

function createChild($pdo) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    $errors = validateChildData($data);
    if (!empty($errors)) {
        sendJson(['error' => 'Validation failed', 'details' => $errors], 400);
    }
    
    try {
        $sql = "INSERT INTO Children (Name, Age, AvatarPath) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            trim($data['Name']),
            $data['Age'] ?? null,
            $data['AvatarPath'] ?? null
        ]);
        
        // Get the created child
        $childId = $pdo->lastInsertId();
        $sql = "SELECT * FROM Children WHERE AutoId = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$childId]);
        $child = $stmt->fetch();
        
        logActivity('Child created', $child);
        sendJson(['success' => true, 'child' => $child], 201);
        
    } catch (Exception $e) {
        sendJson(['error' => 'Failed to create child', 'message' => $e->getMessage()], 500);
    }
}

function getAllBehaviors($pdo) {
    $sql = "SELECT * FROM Behaviors WHERE IsActive = 1 ORDER BY Type DESC, Name";
    $stmt = $pdo->query($sql);
    $behaviors = $stmt->fetchAll();
    sendJson($behaviors);
}

function getBehaviorById($pdo, $id) {
    $sql = "SELECT * FROM Behaviors WHERE Id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    $behavior = $stmt->fetch();
    
    if ($behavior) {
        sendJson($behavior);
    } else {
        sendJson(['error' => 'Behavior not found'], 404);
    }
}

function createBehavior($pdo) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    $errors = validateBehaviorData($data);
    if (!empty($errors)) {
        sendJson(['error' => 'Validation failed', 'details' => $errors], 400);
    }
    
    try {
        $sql = "INSERT INTO Behaviors (Name, Points, Color, Category, Type) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            trim($data['Name']),
            $data['Points'],
            $data['Color'],
            $data['Category'] ?? null,
            $data['Type']
        ]);
        
        sendJson(['success' => true, 'message' => 'Behavior created successfully'], 201);
        
    } catch (Exception $e) {
        sendJson(['error' => 'Failed to create behavior', 'message' => $e->getMessage()], 500);
    }
}

function getAllRewards($pdo) {
    $sql = "SELECT * FROM Rewards WHERE IsActive = 1 ORDER BY Cost, Name";
    $stmt = $pdo->query($sql);
    $rewards = $stmt->fetchAll();
    sendJson($rewards);
}

function getRewardById($pdo, $id) {
    $sql = "SELECT * FROM Rewards WHERE Id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    $reward = $stmt->fetch();
    
    if ($reward) {
        sendJson($reward);
    } else {
        sendJson(['error' => 'Reward not found'], 404);
    }
}

function createReward($pdo) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    $errors = validateRewardData($data);
    if (!empty($errors)) {
        sendJson(['error' => 'Validation failed', 'details' => $errors], 400);
    }
    
    try {
        $sql = "INSERT INTO Rewards (Name, Cost, Color, Category) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            trim($data['Name']),
            $data['Cost'],
            $data['Color'],
            $data['Category'] ?? null
        ]);
        
        sendJson(['success' => true, 'message' => 'Reward created successfully'], 201);
        
    } catch (Exception $e) {
        sendJson(['error' => 'Failed to create reward', 'message' => $e->getMessage()], 500);
    }
}

function getAllActivities($pdo) {
    $sql = "
        SELECT 
            da.*,
            CASE 
                WHEN da.ActivityType IN ('Good', 'Bad') THEN b.Name
                WHEN da.ActivityType = 'Reward' THEN r.Name
                ELSE 'Unknown'
            END as ItemName
        FROM DailyActivity da
        LEFT JOIN Behaviors b ON da.ItemId = b.Id AND da.ActivityType = b.Type
        LEFT JOIN Rewards r ON da.ItemId = r.Id AND da.ActivityType = 'Reward'
        ORDER BY da.ActivityDate DESC, da.CreatedAt DESC
        LIMIT 100
    ";
    
    $stmt = $pdo->query($sql);
    $activities = $stmt->fetchAll();
    sendJson($activities);
}

function createActivity($pdo) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data || !isset($data['ChildId'], $data['ItemId'], $data['ActivityType'])) {
        sendJson(['error' => 'Missing required fields: ChildId, ItemId, ActivityType'], 400);
    }
    
    try {
        // Calculate points based on activity type
        $points = 0;
        $activityType = $data['ActivityType'];
        
        if ($activityType === 'Good' || $activityType === 'Bad') {
            $sql = "SELECT Points FROM Behaviors WHERE Id = ? AND Type = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['ItemId'], $activityType]);
            $behavior = $stmt->fetch();
            
            if ($behavior) {
                $points = $behavior['Points'];
            } else {
                sendJson(['error' => 'Behavior not found'], 404);
            }
        } elseif ($activityType === 'Reward') {
            $sql = "SELECT Cost FROM Rewards WHERE Id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['ItemId']]);
            $reward = $stmt->fetch();
            
            if ($reward) {
                $points = -$reward['Cost']; // Negative because it costs points
            } else {
                sendJson(['error' => 'Reward not found'], 404);
            }
        }
        
        // Insert activity
        $sql = "
            INSERT INTO DailyActivity (ItemId, ChildId, ActivityDate, ActivityType, Count, EarnedPoints, Note) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                Count = Count + ?, 
                EarnedPoints = EarnedPoints + ?,
                UpdatedAt = CURRENT_TIMESTAMP
        ";
        
        $count = $data['Count'] ?? 1;
        $earnedPoints = $points * $count;
        $activityDate = $data['ActivityDate'] ?? date('Y-m-d');
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['ItemId'],
            $data['ChildId'],
            $activityDate,
            $activityType,
            $count,
            $earnedPoints,
            $data['Note'] ?? '',
            $count,        // for ON DUPLICATE KEY UPDATE
            $earnedPoints  // for ON DUPLICATE KEY UPDATE
        ]);
        
        logActivity('Activity recorded', $data);
        sendJson(['success' => true, 'message' => 'Activity recorded successfully'], 201);
        
    } catch (Exception $e) {
        sendJson(['error' => 'Failed to record activity', 'message' => $e->getMessage()], 500);
    }
}

function showApiInfo() {
    sendJson([
        'message' => 'MyKids API v3.0 for MySQL',
        'version' => '3.0.0',
        'database' => 'MySQL on www.sertjerm.com',
        'endpoints' => [
            'GET /?children - ดึงเด็กทั้งหมด',
            'GET /?children={id} - ดึงเด็กคนเดียว',
            'GET /?children={id}&today-score - ดึงคะแนนวันนี้',
            'POST /?children - สร้างเด็กใหม่',
            'GET /?behaviors - ดึงพฤติกรรมทั้งหมด',
            'GET /?good-behaviors หรือ /?tasks - ดึงพฤติกรรมดี',
            'GET /?bad-behaviors - ดึงพฤติกรรมไม่ดี',
            'GET /?rewards - ดึงรางวัล',
            'GET /?activities - ดึงกิจกรรม',
            'POST /?activities - บันทึกกิจกรรม',
            'GET /?daily - ดึงข้อมูลรายวัน',
            'GET /?dashboard - ดึงข้อมูลภาพรวม',
            'GET /?behavior-summary - ดึงสรุปพฤติกรรม',
            'GET /?today-summary - ดึงสรุปวันนี้',
            'GET /?health - ตรวจสอบสถานะ'
        ],
        'example_urls' => [
            'https://www.sertjerm.com/my-kids-api/api.php?children',
            'https://www.sertjerm.com/my-kids-api/api.php?children=C001&today-score',
            'https://www.sertjerm.com/my-kids-api/api.php?good-behaviors',
            'https://www.sertjerm.com/my-kids-api/api.php?bad-behaviors',
            'https://www.sertjerm.com/my-kids-api/api.php?dashboard',
            'https://www.sertjerm.com/my-kids-api/api.php?health'
        ]
    ]);
}
?>