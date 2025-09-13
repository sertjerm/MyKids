<?php
// api.php - MyKids API with Real Database Connection

// ปิด error แสดงออกมา (เฉพาะ production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// ล้าง output buffer
while (ob_get_level()) ob_end_clean();

// Headers - CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // ตรวจสอบ endpoint
    $endpoint = '';
    if (!empty($_GET)) {
        $keys = array_keys($_GET);
        $endpoint = $keys[0] ?? '';
    }

    // เชื่อมต่อ Database
    $pdo = null;
    $dbConnection = false;
    $dbError = '';
    
    if (file_exists('config.php')) {
        try {
            require_once 'config.php';
            
            // ตรวจสอบว่ามี constants หรือไม่
            if (defined('DB_HOST') && defined('DB_NAME') && defined('DB_USER') && defined('DB_PASS')) {
                // ใช้ PDO แบบตรง
                $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
                $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]);
                $dbConnection = true;
            } elseif (function_exists('getDbConnection')) {
                // ใช้ฟังก์ชัน getDbConnection
                $pdo = getDbConnection();
                $dbConnection = true;
            } else {
                $dbError = 'Config loaded but no DB constants or function found';
            }
        } catch (Exception $e) {
            $dbError = $e->getMessage();
            error_log("DB Connection Error: " . $e->getMessage());
        }
    } else {
        $dbError = 'config.php not found';
    }

    // Response ตาม endpoint
    switch ($endpoint) {
        case 'health':
            $childrenCount = 0;
            $dbStatus = 'disconnected';
            
            if ($dbConnection && $pdo) {
                try {
                    // ทดสอบ connection และนับ children
                    $stmt = $pdo->query("SELECT COUNT(*) as count FROM Children WHERE IsActive = 1");
                    $result = $stmt->fetch();
                    $childrenCount = (int)$result['count'];
                    $dbStatus = 'connected';
                } catch (Exception $e) {
                    $dbStatus = 'error: ' . $e->getMessage();
                    error_log("Health Check DB Error: " . $e->getMessage());
                }
            }
            
            echo json_encode([
                'status' => 'OK',
                'message' => 'MyKids API is working!',
                'version' => '3.1.1-database',
                'timestamp' => date('c'),
                'config_exists' => file_exists('config.php'),
                'db_connection' => $dbConnection,
                'db_status' => $dbStatus,
                'db_error' => $dbError,
                'children_count' => $childrenCount,
                'php_version' => PHP_VERSION,
                'server' => $_SERVER['HTTP_HOST'],
                'constants_check' => [
                    'DB_HOST' => defined('DB_HOST') ? 'defined' : 'missing',
                    'DB_NAME' => defined('DB_NAME') ? 'defined' : 'missing',
                    'DB_USER' => defined('DB_USER') ? 'defined' : 'missing',
                    'DB_PASS' => defined('DB_PASS') ? 'defined' : 'missing'
                ]
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            break;
            
        case 'children':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                // เพิ่มเด็กใหม่
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (!$input || empty($input['Name'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing Name field'], JSON_UNESCAPED_UNICODE);
                    exit();
                }
                
                if ($dbConnection && $pdo) {
                    try {
                        // สร้าง ID ใหม่
                        $stmt = $pdo->query("SELECT MAX(CAST(SUBSTRING(Id, 2) AS UNSIGNED)) as max_num FROM Children");
                        $result = $stmt->fetch();
                        $nextNumber = ($result['max_num'] ?? 0) + 1;
                        $newId = 'C' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
                        
                        // Insert
                        $stmt = $pdo->prepare("INSERT INTO Children (Id, Name, Age, AvatarPath, IsActive, CreatedAt) VALUES (?, ?, ?, ?, 1, NOW())");
                        $result = $stmt->execute([
                            $newId,
                            trim($input['Name']),
                            !empty($input['Age']) ? (int)$input['Age'] : null,
                            !empty($input['AvatarPath']) ? $input['AvatarPath'] : '👶'
                        ]);
                        
                        if ($result) {
                            echo json_encode([
                                'success' => true,
                                'message' => 'Child created successfully',
                                'id' => $newId,
                                'data' => [
                                    'Id' => $newId,
                                    'Name' => trim($input['Name']),
                                    'Age' => !empty($input['Age']) ? (int)$input['Age'] : null,
                                    'AvatarPath' => !empty($input['AvatarPath']) ? $input['AvatarPath'] : '👶',
                                    'IsActive' => 1,
                                    'CreatedAt' => date('Y-m-d H:i:s')
                                ]
                            ], JSON_UNESCAPED_UNICODE);
                        } else {
                            http_response_code(500);
                            echo json_encode(['error' => 'Database insert failed'], JSON_UNESCAPED_UNICODE);
                        }
                    } catch (Exception $e) {
                        error_log("Create Child Error: " . $e->getMessage());
                        http_response_code(500);
                        echo json_encode(['error' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
                    }
                } else {
                    http_response_code(503);
                    echo json_encode([
                        'error' => 'Database not connected',
                        'db_error' => $dbError
                    ], JSON_UNESCAPED_UNICODE);
                }
            } else {
                // GET children - ใช้ข้อมูลจาก database จริง
                if ($dbConnection && $pdo) {
                    try {
                        $stmt = $pdo->query("SELECT * FROM Children WHERE IsActive = 1 ORDER BY Name");
                        $children = $stmt->fetchAll();
                        echo json_encode($children, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                    } catch (Exception $e) {
                        error_log("Get Children Error: " . $e->getMessage());
                        http_response_code(500);
                        echo json_encode(['error' => 'Database query failed: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
                    }
                } else {
                    // Mock data เฉพาะกรณี DB ไม่เชื่อม (เพื่อให้ทดสอบได้)
                    echo json_encode([
                        ['Id' => 'C001', 'Name' => 'ทดสอบ1', 'Age' => 8, 'AvatarPath' => '👶', 'IsActive' => 1],
                        ['Id' => 'C002', 'Name' => 'ทดสอบ2', 'Age' => 9, 'AvatarPath' => '🧒', 'IsActive' => 1]
                    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                }
            }
            break;
            
        case 'behaviors':
            // ส่งพฤติกรรมทั้งหมดจาก database
            if ($dbConnection && $pdo) {
                try {
                    $stmt = $pdo->query("SELECT * FROM Behaviors WHERE IsActive = 1 ORDER BY Type, Name");
                    $behaviors = $stmt->fetchAll();
                    echo json_encode($behaviors, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                } catch (Exception $e) {
                    error_log("Get Behaviors Error: " . $e->getMessage());
                    http_response_code(500);
                    echo json_encode(['error' => 'Database query failed: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
                }
            } else {
                // Mock data
                echo json_encode([
                    ['Id' => 'B001', 'Name' => 'ทำการบ้าน', 'Points' => 10, 'Type' => 'Good', 'IsActive' => 1],
                    ['Id' => 'B002', 'Name' => 'ช่วยงานบ้าน', 'Points' => 5, 'Type' => 'Good', 'IsActive' => 1],
                    ['Id' => 'B003', 'Name' => 'ทะเลาะกัน', 'Points' => -5, 'Type' => 'Bad', 'IsActive' => 1]
                ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            }
            break;
            
        case 'good-behaviors':
        case 'tasks':
            // ส่งเฉพาะพฤติกรรมดีจาก database
            if ($dbConnection && $pdo) {
                try {
                    $stmt = $pdo->query("SELECT * FROM Behaviors WHERE Type = 'Good' AND IsActive = 1 ORDER BY Name");
                    $behaviors = $stmt->fetchAll();
                    echo json_encode($behaviors, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                } catch (Exception $e) {
                    error_log("Get Good Behaviors Error: " . $e->getMessage());
                    http_response_code(500);
                    echo json_encode(['error' => 'Database query failed: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
                }
            } else {
                // Mock data - เฉพาะพฤติกรรมดี
                echo json_encode([
                    ['Id' => 'B001', 'Name' => 'ทำการบ้าน', 'Points' => 10, 'Type' => 'Good', 'IsActive' => 1],
                    ['Id' => 'B002', 'Name' => 'ช่วยงานบ้าน', 'Points' => 5, 'Type' => 'Good', 'IsActive' => 1]
                ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            }
            break;
            
        case 'bad-behaviors':
        case 'badbehaviors':
            // ส่งเฉพาะพฤติกรรมไม่ดีจาก database
            if ($dbConnection && $pdo) {
                try {
                    $stmt = $pdo->query("SELECT * FROM Behaviors WHERE Type = 'Bad' AND IsActive = 1 ORDER BY Name");
                    $behaviors = $stmt->fetchAll();
                    echo json_encode($behaviors, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                } catch (Exception $e) {
                    error_log("Get Bad Behaviors Error: " . $e->getMessage());
                    http_response_code(500);
                    echo json_encode(['error' => 'Database query failed: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
                }
            } else {
                // Mock data - เฉพาะพฤติกรรมไม่ดี
                echo json_encode([
                    ['Id' => 'B003', 'Name' => 'ทะเลาะกัน', 'Points' => -5, 'Type' => 'Bad', 'IsActive' => 1]
                ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            }
            break;
            
        case 'rewards':
            // ส่งรางวัลจาก database
            if ($dbConnection && $pdo) {
                try {
                    $stmt = $pdo->query("SELECT * FROM Rewards WHERE IsActive = 1 ORDER BY Cost, Name");
                    $rewards = $stmt->fetchAll();
                    echo json_encode($rewards, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                } catch (Exception $e) {
                    error_log("Get Rewards Error: " . $e->getMessage());
                    http_response_code(500);
                    echo json_encode(['error' => 'Database query failed: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
                }
            } else {
                // Mock data
                echo json_encode([
                    ['Id' => 'R001', 'Name' => 'ขนมโปรด', 'Cost' => 10, 'IsActive' => 1],
                    ['Id' => 'R002', 'Name' => 'ดูการ์ตูน 30 นาที', 'Cost' => 15, 'IsActive' => 1],
                    ['Id' => 'R003', 'Name' => 'ของเล่นใหม่', 'Cost' => 50, 'IsActive' => 1]
                ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            }
            break;
            
        case 'activities':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                // บันทึกกิจกรรม
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (!$input || empty($input['ChildId']) || empty($input['ItemId'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing ChildId or ItemId'], JSON_UNESCAPED_UNICODE);
                    exit();
                }
                
                if ($dbConnection && $pdo) {
                    try {
                        $stmt = $pdo->prepare("INSERT INTO DailyActivity (ChildId, ItemId, ActivityType, Count, Note, ActivityDate, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW())");
                        $result = $stmt->execute([
                            $input['ChildId'],
                            $input['ItemId'],
                            $input['ActivityType'] ?? 'Behavior',
                            $input['Count'] ?? 1,
                            $input['Note'] ?? '',
                            $input['ActivityDate'] ?? date('Y-m-d')
                        ]);
                        
                        if ($result) {
                            echo json_encode([
                                'success' => true,
                                'message' => 'Activity recorded successfully',
                                'data' => array_merge($input, [
                                    'ActivityType' => $input['ActivityType'] ?? 'Behavior',
                                    'Count' => $input['Count'] ?? 1,
                                    'ActivityDate' => $input['ActivityDate'] ?? date('Y-m-d'),
                                    'CreatedAt' => date('Y-m-d H:i:s')
                                ])
                            ], JSON_UNESCAPED_UNICODE);
                        } else {
                            http_response_code(500);
                            echo json_encode(['error' => 'Failed to record activity'], JSON_UNESCAPED_UNICODE);
                        }
                    } catch (Exception $e) {
                        error_log("Record Activity Error: " . $e->getMessage());
                        http_response_code(500);
                        echo json_encode(['error' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
                    }
                } else {
                    http_response_code(503);
                    echo json_encode([
                        'error' => 'Database not connected',
                        'db_error' => $dbError
                    ], JSON_UNESCAPED_UNICODE);
                }
            } else {
                // GET activities
                if ($dbConnection && $pdo) {
                    try {
                        $stmt = $pdo->query("
                            SELECT da.*, c.Name as ChildName, 
                                   CASE 
                                       WHEN b.Name IS NOT NULL THEN b.Name
                                       WHEN r.Name IS NOT NULL THEN r.Name
                                       ELSE da.ItemId
                                   END as ItemName
                            FROM DailyActivity da
                            LEFT JOIN Children c ON da.ChildId = c.Id
                            LEFT JOIN Behaviors b ON da.ItemId = b.Id
                            LEFT JOIN Rewards r ON da.ItemId = r.Id
                            ORDER BY da.CreatedAt DESC 
                            LIMIT 20
                        ");
                        $activities = $stmt->fetchAll();
                        echo json_encode($activities, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                    } catch (Exception $e) {
                        error_log("Get Activities Error: " . $e->getMessage());
                        http_response_code(500);
                        echo json_encode(['error' => 'Database query failed: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
                    }
                } else {
                    // Mock data
                    echo json_encode([
                        ['ChildId' => 'C001', 'ItemId' => 'B001', 'ActivityType' => 'Behavior', 'Count' => 1, 'ActivityDate' => date('Y-m-d'), 'ChildName' => 'ทดสอบ1', 'ItemName' => 'ทำการบ้าน'],
                        ['ChildId' => 'C002', 'ItemId' => 'B002', 'ActivityType' => 'Behavior', 'Count' => 1, 'ActivityDate' => date('Y-m-d'), 'ChildName' => 'ทดสอบ2', 'ItemName' => 'ช่วยงานบ้าน']
                    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                }
            }
            break;
            
        case 'dashboard':
            if ($dbConnection && $pdo) {
                try {
                    // ข้อมูลจริงจาก database
                    $stmt = $pdo->query("
                        SELECT c.Id, c.Name, c.Age, c.AvatarPath,
                               COALESCE(SUM(CASE 
                                   WHEN da.ActivityDate = CURDATE() THEN 
                                       CASE WHEN b.Points IS NOT NULL THEN b.Points * da.Count ELSE 0 END 
                               END), 0) as TodayPoints,
                               COALESCE(SUM(CASE 
                                   WHEN b.Points IS NOT NULL THEN b.Points * da.Count ELSE 0 END), 0) as TotalPoints
                        FROM Children c
                        LEFT JOIN DailyActivity da ON c.Id = da.ChildId
                        LEFT JOIN Behaviors b ON da.ItemId = b.Id
                        WHERE c.IsActive = 1
                        GROUP BY c.Id, c.Name, c.Age, c.AvatarPath
                        ORDER BY c.Name
                    ");
                    $children = $stmt->fetchAll();
                    
                    echo json_encode([
                        'children' => $children,
                        'timestamp' => date('c'),
                        'total_children' => count($children),
                        'date' => date('Y-m-d'),
                        'database' => 'connected'
                    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                } catch (Exception $e) {
                    error_log("Dashboard Error: " . $e->getMessage());
                    // Fallback data with error
                    echo json_encode([
                        'children' => [
                            ['Id' => 'C001', 'Name' => 'ทดสอบ1', 'TodayPoints' => 15, 'TotalPoints' => 45],
                            ['Id' => 'C002', 'Name' => 'ทดสอบ2', 'TodayPoints' => 8, 'TotalPoints' => 32]
                        ],
                        'timestamp' => date('c'),
                        'total_children' => 2,
                        'date' => date('Y-m-d'),
                        'database' => 'error',
                        'error' => $e->getMessage()
                    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                }
            } else {
                // Mock data
                echo json_encode([
                    'children' => [
                        ['Id' => 'C001', 'Name' => 'ทดสอบ1', 'TodayPoints' => 15, 'TotalPoints' => 45],
                        ['Id' => 'C002', 'Name' => 'ทดสอบ2', 'TodayPoints' => 8, 'TotalPoints' => 32]
                    ],
                    'timestamp' => date('c'),
                    'total_children' => 2,
                    'date' => date('Y-m-d'),
                    'database' => 'disconnected',
                    'db_error' => $dbError
                ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            }
            break;
            
        case 'score':
        case 'points':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);

                if (!$input || empty($input['ChildId']) || !isset($input['Points'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing ChildId or Points'], JSON_UNESCAPED_UNICODE);
                    exit();
                }

                if ($dbConnection && $pdo) {
                    try {
                        // สร้าง ItemId เป็น null หรือ custom เช่น 'MANUAL'
                        $stmt = $pdo->prepare("INSERT INTO DailyActivity (ChildId, ItemId, ActivityType, Count, Note, ActivityDate, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW())");
                        $result = $stmt->execute([
                            $input['ChildId'],
                            null, // หรือ 'MANUAL'
                            'Score',
                            $input['Points'],
                            $input['Note'] ?? '',
                            $input['ActivityDate'] ?? date('Y-m-d')
                        ]);

                        if ($result) {
                            echo json_encode([
                                'success' => true,
                                'message' => 'Score recorded successfully',
                                'data' => [
                                    'ChildId' => $input['ChildId'],
                                    'Points' => $input['Points'],
                                    'Note' => $input['Note'] ?? '',
                                    'ActivityDate' => $input['ActivityDate'] ?? date('Y-m-d'),
                                    'CreatedAt' => date('Y-m-d H:i:s')
                            ]
                            ], JSON_UNESCAPED_UNICODE);
                        } else {
                            http_response_code(500);
                            echo json_encode(['error' => 'Failed to record score'], JSON_UNESCAPED_UNICODE);
                        }
                    } catch (Exception $e) {
                        error_log("Record Score Error: " . $e->getMessage());
                        http_response_code(500);
                        echo json_encode(['error' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
                    }
                } else {
                    http_response_code(503);
                    echo json_encode([
                        'error' => 'Database not connected',
                        'db_error' => $dbError
                    ], JSON_UNESCAPED_UNICODE);
                }
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
            }
            break;
            
        default:
            echo json_encode([
                'message' => 'MyKids API v3.1.1',
                'status' => 'OK',
                'endpoints' => [
                    '?health - Health check and database status',
                    '?children - Children data (GET/POST)',
                    '?behaviors - All behaviors data',
                    '?good-behaviors - Good behaviors only', 
                    '?bad-behaviors - Bad behaviors only',
                    '?rewards - Rewards data',
                    '?activities - Activities data (GET/POST)',
                    '?dashboard - Dashboard summary with real data'
                ],
                'debug_info' => [
                    'request_method' => $_SERVER['REQUEST_METHOD'],
                    'endpoint' => $endpoint,
                    'config_exists' => file_exists('config.php'),
                    'db_connection' => $dbConnection,
                    'db_error' => $dbError,
                    'php_version' => PHP_VERSION,
                    'current_time' => date('Y-m-d H:i:s')
                ]
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            break;
    }

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage(),
        'debug' => [
            'file' => basename(__FILE__),
            'line' => $e->getLine(),
            'time' => date('Y-m-d H:i:s'),
            'trace' => $e->getTraceAsString()
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>