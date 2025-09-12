<?php
// api.php - Simple version for testing

// Basic headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Load config
    if (!file_exists('config.php')) {
        throw new Exception('Config file not found');
    }
    
    require_once 'config.php';
    
    // Get endpoint
    $endpoint = '';
    if (!empty($_GET)) {
        $keys = array_keys($_GET);
        $endpoint = $keys[0] ?? '';
    }
    
    // Connect to database
    $pdo = getDbConnection();
    
    // ฟังก์ชันช่วยส่ง JSON พร้อมสถานะ
    function sendJson($data, $status = 200) {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();
    }

    // Handle endpoints
    switch ($endpoint) {
        case 'health':
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM Children WHERE IsActive = 1");
            $count = $stmt->fetch()['count'];
            
            echo json_encode([
                'status' => 'OK',
                'message' => 'MyKids API is working!',
                'version' => '3.0.0',
                'timestamp' => date('c'),
                'children_count' => (int)$count,
                'database' => 'Connected'
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            break;
            
        case 'children':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);

                // ตรวจสอบข้อมูลพื้นฐาน
                if (!$input || empty($input['Name']) || trim($input['Name']) === '') {
                    sendJson(['error' => 'Missing or empty Name field'], 400);
                    return;
                }

                try {
                    // สร้าง ID ใหม่โดยไม่ validate pattern ก่อน
                    $stmt = $pdo->query("SELECT MAX(CAST(SUBSTRING(Id, 2) AS UNSIGNED)) as max_num FROM Children");
                    $result = $stmt->fetch();
                    $nextNumber = ($result['max_num'] ?? 0) + 1;
                    $newId = 'C' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

                    // Insert ข้อมูลเลย ไม่ validate
                    $stmt = $pdo->prepare("INSERT INTO Children (Id, Name, Age, AvatarPath, IsActive, CreatedAt) VALUES (?, ?, ?, ?, 1, NOW())");

                    $name = trim($input['Name']);
                    $age = !empty($input['Age']) ? (int)$input['Age'] : null;
                    $avatar = !empty($input['AvatarPath']) ? $input['AvatarPath'] : '👶';

                    $result = $stmt->execute([$newId, $name, $age, $avatar]);

                    if ($result) {
                        // ดึงข้อมูลที่เพิ่งสร้าง
                        $stmt = $pdo->prepare("SELECT * FROM Children WHERE Id = ?");
                        $stmt->execute([$newId]);
                        $newChild = $stmt->fetch();

                        sendJson([
                            'success' => true,
                            'message' => 'Child created successfully',
                            'data' => $newChild
                        ], 201);
                    } else {
                        sendJson(['error' => 'Database insert failed'], 500);
                    }

                } catch (Exception $e) {
                    sendJson(['error' => 'Server error: ' . $e->getMessage()], 500);
                }
                return;
            }
            $stmt = $pdo->query("SELECT * FROM Children WHERE IsActive = 1 ORDER BY Name");
            $children = $stmt->fetchAll();
            echo json_encode($children, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            break;

        case 'behaviors':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (!$input || !isset($input['Name']) || !isset($input['Points']) || !isset($input['Type'])) {
                    sendJson(['error' => 'Missing required fields: Name, Points, Type'], 400);
                }
                
                try {
                    $stmt = $pdo->query("SELECT Id FROM Behaviors ORDER BY CreatedAt DESC LIMIT 1");
                    $lastBehavior = $stmt->fetch();
                    
                    if ($lastBehavior) {
                        $lastNumber = (int)substr($lastBehavior['Id'], 1);
                        $newId = 'B' . str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
                    } else {
                        $newId = 'B001';
                    }
                    
                    $stmt = $pdo->prepare("
                        INSERT INTO Behaviors (Id, Name, Points, Color, Category, Type, IsRepeatable, IsActive, CreatedAt) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())
                    ");
                    
                    $result = $stmt->execute([
                        $newId,
                        $input['Name'],
                        $input['Points'],
                        $input['Color'] ?? '#E5E7EB',
                        $input['Category'] ?? 'General',
                        $input['Type'],
                        $input['Type'] === 'Bad' ? 1 : 0
                    ]);
                    
                    if ($result) {
                        $stmt = $pdo->prepare("SELECT * FROM Behaviors WHERE Id = ?");
                        $stmt->execute([$newId]);
                        $newBehavior = $stmt->fetch();
                        
                        sendJson([
                            'success' => true,
                            'message' => 'Behavior created successfully',
                            'data' => $newBehavior
                        ], 201);
                    } else {
                        sendJson(['error' => 'Failed to create behavior'], 500);
                    }
                } catch (Exception $e) {
                    sendJson(['error' => 'Failed to create behavior', 'message' => $e->getMessage()], 500);
                }
                return;
            }
            $stmt = $pdo->query("SELECT * FROM Behaviors WHERE IsActive = 1 ORDER BY Type, Name");
            $behaviors = $stmt->fetchAll();
            echo json_encode($behaviors, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            break;

        case 'rewards':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (!$input || !isset($input['Name']) || !isset($input['Cost'])) {
                    sendJson(['error' => 'Missing required fields: Name, Cost'], 400);
                }
                
                try {
                    $stmt = $pdo->query("SELECT Id FROM Rewards ORDER BY CreatedAt DESC LIMIT 1");
                    $lastReward = $stmt->fetch();
                    
                    if ($lastReward) {
                        $lastNumber = (int)substr($lastReward['Id'], 1);
                        $newId = 'R' . str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
                    } else {
                        $newId = 'R001';
                    }
                    
                    $stmt = $pdo->prepare("
                        INSERT INTO Rewards (Id, Name, Cost, Color, Category, Description, IsActive, CreatedAt) 
                        VALUES (?, ?, ?, ?, ?, ?, 1, NOW())
                    ");
                    
                    $result = $stmt->execute([
                        $newId,
                        $input['Name'],
                        $input['Cost'],
                        $input['Color'] ?? '#FFB6C1',
                        $input['Category'] ?? 'General',
                        $input['Description'] ?? ''
                    ]);
                    
                    if ($result) {
                        $stmt = $pdo->prepare("SELECT * FROM Rewards WHERE Id = ?");
                        $stmt->execute([$newId]);
                        $newReward = $stmt->fetch();
                        
                        sendJson([
                            'success' => true,
                            'message' => 'Reward created successfully',
                            'data' => $newReward
                        ], 201);
                    } else {
                        sendJson(['error' => 'Failed to create reward'], 500);
                    }
                } catch (Exception $e) {
                    sendJson(['error' => 'Failed to create reward', 'message' => $e->getMessage()], 500);
                }
                return;
            }
            $stmt = $pdo->query("SELECT * FROM Rewards WHERE IsActive = 1 ORDER BY Cost");
            $rewards = $stmt->fetchAll();
            echo json_encode($rewards, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            break;
            
        case 'dashboard':
            $stmt = $pdo->query("
                SELECT c.*, 
                       COALESCE(t.TodayPoints, 0) as TodayPoints
                FROM Children c
                LEFT JOIN (
                    SELECT ChildId, SUM(EarnedPoints) as TodayPoints 
                    FROM DailyActivity 
                    WHERE ActivityDate = CURDATE() 
                    GROUP BY ChildId
                ) t ON c.Id = t.ChildId
                WHERE c.IsActive = 1
                ORDER BY c.Name
            ");
            $children = $stmt->fetchAll();
            
            echo json_encode([
                'children' => $children,
                'timestamp' => date('c')
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            break;
            
        case 'activities':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (!$input || !isset($input['ChildId']) || !isset($input['ItemId'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing required fields'], JSON_UNESCAPED_UNICODE);
                    exit();
                }
                
                // Simple activity recording
                $stmt = $pdo->prepare("
                    INSERT INTO DailyActivity (ItemId, ChildId, ActivityDate, ActivityType, Count, EarnedPoints, CreatedAt) 
                    VALUES (?, ?, CURDATE(), 'Behavior', 1, 0, NOW())
                ");
                $stmt->execute([$input['ItemId'], $input['ChildId']]);
                
                echo json_encode(['success' => true, 'message' => 'Activity recorded'], JSON_UNESCAPED_UNICODE);
            } else {
                $stmt = $pdo->query("SELECT * FROM DailyActivity WHERE ActivityDate = CURDATE() ORDER BY CreatedAt DESC LIMIT 10");
                $activities = $stmt->fetchAll();
                echo json_encode($activities, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            }
            break;
            
        default:
            echo json_encode([
                'message' => 'MyKids API v3.0 - Simple Version',
                'status' => 'OK',
                'endpoints' => [
                    '?health - Health check',
                    '?children - Get children',
                    '?behaviors - Get behaviors',
                    '?good-behaviors - Get good behaviors',
                    '?bad-behaviors - Get bad behaviors',
                    '?rewards - Get rewards',
                    '?dashboard - Get dashboard',
                    '?activities - Get/Post activities'
                ]
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage(),
        'file' => basename(__FILE__),
        'line' => __LINE__
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>