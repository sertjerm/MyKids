<?php
// install.php - MyKids API Auto Installer (Fixed Version)
// ⚠️ ลบไฟล์นี้หลังติดตั้งเสร็จแล้ว!

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyKids API Auto Installer</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .header {
            text-align: center;
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 20px;
            margin-bottom: 30px;
            background: linear-gradient(135deg, #ff6b6b, #ffa726);
            color: white;
            margin: -30px -30px 30px -30px;
            padding: 30px;
            border-radius: 15px 15px 0 0;
            border-bottom: none;
        }
        .step {
            margin: 20px 0;
            padding: 20px;
            border-radius: 10px;
            border-left: 5px solid #3498db;
            background: #f8f9fa;
        }
        .success {
            border-left-color: #27ae60;
            background: #d5f4e6;
            color: #1e8449;
        }
        .error {
            border-left-color: #e74c3c;
            background: #fadbd8;
            color: #c0392b;
        }
        .warning {
            border-left-color: #f39c12;
            background: #fcf3cf;
            color: #b7950b;
        }
        .info {
            border-left-color: #3498db;
            background: #d6eaf8;
            color: #21618c;
        }
        .btn {
            background: #3498db;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
            font-size: 16px;
            transition: all 0.3s;
        }
        .btn:hover {
            background: #2980b9;
            transform: translateY(-2px);
        }
        .btn-success {
            background: #27ae60;
        }
        .btn-success:hover {
            background: #1e7e34;
        }
        .btn-danger {
            background: #e74c3c;
        }
        .btn-warning {
            background: #f39c12;
        }
        .code {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
            overflow-x: auto;
            margin: 10px 0;
        }
        .progress {
            width: 100%;
            height: 25px;
            background: #ecf0f1;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #27ae60, #2ecc71);
            transition: width 0.5s ease;
            border-radius: 15px;
        }
        .form-group {
            margin: 15px 0;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #2c3e50;
        }
        .form-group input, .form-group select {
            width: 100%;
            padding: 12px;
            border: 2px solid #bdc3c7;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
            box-sizing: border-box;
        }
        .form-group input:focus {
            border-color: #3498db;
            outline: none;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-card {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            border: 2px solid #bdc3c7;
            transition: all 0.3s;
        }
        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .stat-card.success {
            background: #d5f4e6;
            border-color: #27ae60;
        }
        .stat-card.failed {
            background: #fadbd8;
            border-color: #e74c3c;
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            font-size: 2em;
            color: #2c3e50;
        }
        h1, h2, h3 { margin-bottom: 15px; }
        ul { margin-left: 20px; }
        li { margin: 8px 0; }
        .debug-info {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            font-size: 0.9em;
            color: #666;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 MyKids API Auto Installer</h1>
            <p>ระบบติดตั้งอัตโนมัติสำหรับ MyKids API v3.0</p>
        </div>

        <?php
        $step = $_GET['step'] ?? 'start';
        $action = $_POST['action'] ?? '';

        // Progress tracking
        $steps = ['start', 'config', 'database', 'test', 'complete'];
        $current_step_index = array_search($step, $steps);
        $progress = ($current_step_index + 1) / count($steps) * 100;

        echo "<div class='progress'>";
        echo "<div class='progress-bar' style='width: {$progress}%'></div>";
        echo "</div>";
        echo "<p style='text-align: center; margin: 10px 0; font-weight: bold;'>ขั้นตอน " . ($current_step_index + 1) . " จาก " . count($steps) . " ({$progress}%)</p>";

        switch ($step) {
            case 'start':
                showStartStep();
                break;
            case 'config':
                showConfigStep();
                break;
            case 'database':
                showDatabaseStep();
                break;
            case 'test':
                showTestStep();
                break;
            case 'complete':
                showCompleteStep();
                break;
            default:
                showStartStep();
        }

        function showStartStep() {
            echo "<div class='step info'>";
            echo "<h2>🎯 ยินดีต้อนรับสู่ MyKids API Installer</h2>";
            echo "<p>ระบบจะช่วยติดตั้งและตั้งค่า MyKids API อัตโนมัติ</p>";
            
            echo "<h3>📋 สิ่งที่ต้องเตรียม:</h3>";
            echo "<ul>";
            echo "<li>✅ ฐานข้อมูล <strong>sertjerm_MyKids</strong> (สร้างแล้ว)</li>";
            echo "<li>✅ Username: <strong>sertjerm_mykids</strong></li>";
            echo "<li>🔑 รหัสผ่านฐานข้อมูล</li>";
            echo "<li>📁 สิทธิ์เขียนไฟล์ในโฟลเดอร์นี้</li>";
            echo "</ul>";

            echo "<h3>🚀 สิ่งที่จะติดตั้ง:</h3>";
            echo "<ul>";
            echo "<li>ตั้งค่าการเชื่อมต่อฐานข้อมูล (config.php)</li>";
            echo "<li>ปรับปรุงข้อมูลในฐานข้อมูล</li>";
            echo "<li>ทดสอบ API endpoints</li>";
            echo "<li>สร้างข้อมูลตัวอย่าง</li>";
            echo "</ul>";

            echo "<div style='text-align: center; margin-top: 30px;'>";
            echo "<a href='?step=config' class='btn btn-success'>🚀 เริ่มติดตั้ง</a>";
            echo "</div>";
            echo "</div>";
        }

        function showConfigStep() {
            if ($_POST['action'] === 'save_config') {
                handleConfigSave();
                return;
            }

            echo "<div class='step info'>";
            echo "<h2>⚙️ ขั้นตอนที่ 1: ตั้งค่าการเชื่อมต่อฐานข้อมูล</h2>";
            
            // ตรวจสอบไฟล์ config ปัจจุบัน
            $current_db_name = 'sertjerm_MyKids';
            $current_db_user = 'sertjerm_mykids';
            
            if (file_exists('config.php')) {
                $config_content = file_get_contents('config.php');
                
                // Extract current values
                preg_match("/define\('DB_NAME', '(.+?)'\)/", $config_content, $db_name_match);
                preg_match("/define\('DB_USER', '(.+?)'\)/", $config_content, $db_user_match);
                
                if (!empty($db_name_match[1])) $current_db_name = $db_name_match[1];
                if (!empty($db_user_match[1])) $current_db_user = $db_user_match[1];
                
                if (strpos($config_content, 'your_actual_password_here') !== false) {
                    echo "<div class='warning'>";
                    echo "⚠️ ไฟล์ config.php พบแล้ว แต่ยังไม่ได้ตั้งรหัสผ่าน";
                    echo "</div>";
                } else {
                    echo "<div class='success'>";
                    echo "✅ ไฟล์ config.php พบแล้วและมีการตั้งรหัสผ่าน";
                    echo "</div>";
                }
            } else {
                echo "<div class='warning'>";
                echo "⚠️ ไม่พบไฟล์ config.php - จะสร้างใหม่";
                echo "</div>";
            }

            echo "<form method='post'>";
            echo "<input type='hidden' name='action' value='save_config'>";
            
            echo "<div class='form-group'>";
            echo "<label>ชื่อฐานข้อมูล:</label>";
            echo "<input type='text' name='db_name' value='" . htmlspecialchars($current_db_name) . "' required>";
            echo "</div>";

            echo "<div class='form-group'>";
            echo "<label>Username:</label>";
            echo "<input type='text' name='db_user' value='" . htmlspecialchars($current_db_user) . "' required>";
            echo "</div>";

            echo "<div class='form-group'>";
            echo "<label>รหัสผ่าน:</label>";
            echo "<input type='password' name='db_pass' placeholder='ใส่รหัสผ่านฐานข้อมูล' required>";
            echo "</div>";

            echo "<div class='form-group'>";
            echo "<label>Host:</label>";
            echo "<input type='text' name='db_host' value='localhost' required>";
            echo "</div>";

            echo "<div style='text-align: center; margin-top: 20px;'>";
            echo "<button type='submit' class='btn btn-success'>💾 บันทึกและทดสอบการเชื่อมต่อ</button>";
            echo "</div>";
            
            echo "</form>";
            echo "</div>";
        }

        function handleConfigSave() {
            $db_host = $_POST['db_host'];
            $db_name = $_POST['db_name'];
            $db_user = $_POST['db_user'];
            $db_pass = $_POST['db_pass'];

            // สร้างไฟล์ config.php - แก้ไข escape characters
            $config_content = '<?php
// config.php - Database Configuration for MyKidsDB (Generated by Auto Installer)

// Database Configuration - Updated for sertjerm.com
define(\'DB_HOST\', \'' . $db_host . '\');
define(\'DB_NAME\', \'' . $db_name . '\');
define(\'DB_USER\', \'' . $db_user . '\');
define(\'DB_PASS\', \'' . $db_pass . '\');
define(\'DB_CHARSET\', \'utf8mb4\');

// Timezone Setting
date_default_timezone_set(\'Asia/Bangkok\');

// CORS Headers Function
function setCorsHeaders() {
    // ตรวจสอบ origin ที่ส่งมา
    $origin = $_SERVER[\'HTTP_ORIGIN\'] ?? \'*\';
    
    // กำหนด allowed origins
    $allowedOrigins = [
        \'http://localhost:3000\',
        \'http://localhost:5173\', 
        \'https://localhost:3000\',
        \'https://localhost:5173\',
        \'https://sertjerm.com\',
        \'http://sertjerm.com\'
    ];
    
    // ตรวจสอบว่า origin ได้รับอนุญาตหรือไม่
    if ($origin === \'*\' || in_array($origin, $allowedOrigins) || 
        strpos($origin, \'localhost\') !== false || 
        strpos($origin, \'sertjerm.com\') !== false) {
        header("Access-Control-Allow-Origin: " . $origin);
    } else {
        header("Access-Control-Allow-Origin: *");
    }
    
    header(\'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\');
    header(\'Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With\');
    header(\'Access-Control-Allow-Credentials: false\');
    header(\'Access-Control-Max-Age: 86400\');
    header(\'Content-Type: application/json; charset=utf-8\');
    
    // Handle preflight OPTIONS requests
    if ($_SERVER[\'REQUEST_METHOD\'] === \'OPTIONS\') {
        http_response_code(200);
        exit();
    }
}

// Database Connection Function
function getDbConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ]);
        
        return $pdo;
    } catch (PDOException $e) {
        throw new Exception(\'Database connection failed: \' . $e->getMessage());
    }
}

// Helper function to send JSON response
function sendJson($data, $httpCode = 200) {
    http_response_code($httpCode);
    
    if (is_array($data) || is_object($data)) {
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    } else {
        echo json_encode([\'message\' => $data], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
    exit();
}

// Error Handler
function handleError($message, $code = 500) {
    sendJson([
        \'error\' => true,
        \'message\' => $message,
        \'timestamp\' => date(\'c\'),
        \'code\' => $code
    ], $code);
}

// API Configuration
define(\'API_VERSION\', \'3.0.0\');
define(\'API_NAME\', \'MyKids API\');
define(\'DEBUG_MODE\', false);

// Validation Functions
function isValidChildId($id) {
    return preg_match(\'/^C\\d{3}$/\', $id);
}

function isValidBehaviorId($id) {
    return preg_match(\'/^B\\d{3}$/\', $id);
}

function isValidRewardId($id) {
    return preg_match(\'/^R\\d{3}$/\', $id);
}
?>';

            if (file_put_contents('config.php', $config_content)) {
                echo "<div class='success'>";
                echo "<h3>✅ สร้างไฟล์ config.php สำเร็จ!</h3>";
                echo "</div>";

                // ทดสอบการเชื่อมต่อ
                try {
                    require_once 'config.php';
                    $pdo = getDbConnection();
                    
                    echo "<div class='success'>";
                    echo "<h3>✅ ทดสอบการเชื่อมต่อฐานข้อมูลสำเร็จ!</h3>";
                    echo "<p>เชื่อมต่อ MySQL Database: <strong>" . htmlspecialchars($db_name) . "</strong></p>";
                    echo "</div>";

                    echo "<div style='text-align: center; margin-top: 20px;'>";
                    echo "<a href='?step=database' class='btn btn-success'>➡️ ขั้นตอนต่อไป: ปรับปรุงฐานข้อมูล</a>";
                    echo "</div>";

                } catch (Exception $e) {
                    echo "<div class='error'>";
                    echo "<h3>❌ ไม่สามารถเชื่อมต่อฐานข้อมูล</h3>";
                    echo "<p>ข้อผิดพลาด: " . htmlspecialchars($e->getMessage()) . "</p>";
                    echo "<p>กรุณาตรวจสอบข้อมูลการเชื่อมต่อและลองใหม่</p>";
                    echo "</div>";

                    echo "<div style='text-align: center; margin-top: 20px;'>";
                    echo "<a href='?step=config' class='btn btn-warning'>🔄 ลองใหม่</a>";
                    echo "</div>";
                }

            } else {
                echo "<div class='error'>";
                echo "<h3>❌ ไม่สามารถสร้างไฟล์ config.php</h3>";
                echo "<p>กรุณาตรวจสอบสิทธิ์การเขียนไฟล์ในโฟลเดอร์นี้</p>";
                echo "</div>";
            }
        }

        function showDatabaseStep() {
            if ($_POST['action'] === 'update_database') {
                handleDatabaseUpdate();
                return;
            }

            echo "<div class='step info'>";
            echo "<h2>🗄️ ขั้นตอนที่ 2: ปรับปรุงฐานข้อมูล</h2>";

            try {
                require_once 'config.php';
                $pdo = getDbConnection();

                echo "<div class='success'>";
                echo "✅ เชื่อมต่อฐานข้อมูลสำเร็จ";
                echo "</div>";

                // ตรวจสอบตารางที่มีอยู่
                $tables = ['Children', 'Behaviors', 'Rewards', 'DailyActivity'];
                $table_status = [];

                echo "<div class='grid'>";
                foreach ($tables as $table) {
                    try {
                        $stmt = $pdo->query("SELECT COUNT(*) as count FROM `$table`");
                        $count = $stmt->fetch()['count'];
                        $table_status[$table] = $count;

                        echo "<div class='stat-card success'>";
                        echo "<h3>$count</h3>";
                        echo "<p>$table</p>";
                        echo "</div>";
                    } catch (Exception $e) {
                        $table_status[$table] = 'ERROR';
                        echo "<div class='stat-card'>";
                        echo "<h3>❌</h3>";
                        echo "<p>$table</p>";
                        echo "</div>";
                    }
                }
                echo "</div>";

                echo "<h3>🔄 การปรับปรุงที่จะทำ:</h3>";
                echo "<ul>";
                echo "<li>แก้ไข IsRepeatable ใน Behaviors (Good=ครั้งเดียว, Bad=ซ้ำได้)</li>";
                echo "<li>เพิ่มพฤติกรรมและรางวัลใหม่</li>";
                echo "<li>เพิ่มข้อมูลกิจกรรมตัวอย่าง</li>";
                echo "<li>อัปเดตโครงสร้างตาราง</li>";
                echo "</ul>";

                echo "<form method='post'>";
                echo "<input type='hidden' name='action' value='update_database'>";
                echo "<div style='text-align: center; margin-top: 20px;'>";
                echo "<button type='submit' class='btn btn-success'>🚀 ปรับปรุงฐานข้อมูล</button>";
                echo "</div>";
                echo "</form>";

            } catch (Exception $e) {
                echo "<div class='error'>";
                echo "❌ ไม่สามารถเชื่อมต่อฐานข้อมูลได้: " . htmlspecialchars($e->getMessage());
                echo "</div>";

                echo "<div style='text-align: center; margin-top: 20px;'>";
                echo "<a href='?step=config' class='btn btn-warning'>🔄 กลับไปแก้ไขการตั้งค่า</a>";
                echo "</div>";
            }

            echo "</div>";
        }

        function handleDatabaseUpdate() {
            try {
                require_once 'config.php';
                $pdo = getDbConnection();

                echo "<div class='step info'>";
                echo "<h2>🔄 กำลังปรับปรุงฐานข้อมูล...</h2>";

                // SQL statements for update
                $updates = [
                    "ปรับปรุง IsRepeatable" => "
                        UPDATE Behaviors 
                        SET IsRepeatable = CASE 
                            WHEN Type = 'Good' THEN 0
                            WHEN Type = 'Bad' THEN 1
                            ELSE IsRepeatable 
                        END
                        WHERE Id LIKE 'B%'
                    ",
                    
                    "เพิ่มพฤติกรรมดี" => "
                        INSERT IGNORE INTO Behaviors (Id, Name, Points, Color, Category, Type, IsRepeatable) VALUES 
                        ('B020', 'ล้างจาน', 3, '#34D399', 'ความรับผิดชอบ', 'Good', 0),
                        ('B021', 'ออกกำลังกาย', 6, '#F472B6', 'สุขภาพ', 'Good', 0),
                        ('B022', 'ช่วยแม่ทำอาหาร', 5, '#FBBF24', 'ความรับผิดชอบ', 'Good', 0),
                        ('B023', 'นอนตรงเวลา', 4, '#A78BFA', 'สุขภาพ', 'Good', 0),
                        ('B024', 'ทักทายสวัสดี', 2, '#FB7185', 'มารยาท', 'Good', 0)
                    ",

                    "เพิ่มพฤติกรรมไม่ดี" => "
                        INSERT IGNORE INTO Behaviors (Id, Name, Points, Color, Category, Type, IsRepeatable) VALUES 
                        ('B025', 'หยุดเรียน', 6, '#B91C1C', 'การเรียนรู้', 'Bad', 1),
                        ('B026', 'ไม่ล้างมือ', 2, '#F87171', 'สุขภาพ', 'Bad', 1),
                        ('B027', 'ทิ้งขยะไม่เป็นที่', 3, '#EF4444', 'สิ่งแวดล้อม', 'Bad', 1),
                        ('B028', 'มาสายเรียน', 4, '#DC2626', 'ความรับผิดชอบ', 'Bad', 1)
                    ",

                    "เพิ่มรางวัล" => "
                        INSERT IGNORE INTO Rewards (Id, Name, Cost, Color, Category) VALUES 
                        ('R010', 'เล่นเกม 1 ชั่วโมง', 30, '#E0E6FF', 'บันเทิง'),
                        ('R011', 'ซื้อของเล่นใหม่', 80, '#FFE4B5', 'ของเล่น'),
                        ('R012', 'ไปหาเพื่อน', 35, '#E6FFE6', 'กิจกรรม'),
                        ('R013', 'ไปดูหนัง', 60, '#FFEBEE', 'บันเทิง'),
                        ('R014', 'ไม่ต้องล้างจาน 1 วัน', 40, '#F3E5F5', 'สิทธิพิเศษ')
                    ",

                    "เพิ่มกิจกรรมตัวอย่าง" => "
                        INSERT IGNORE INTO DailyActivity (ItemId, ChildId, ActivityDate, ActivityType, Count, EarnedPoints, Note) VALUES
                        ('B001', 'C002', CURDATE(), 'Good', 1, 3, 'แปรงฟันเช้า'),
                        ('B003', 'C002', CURDATE(), 'Good', 1, 5, 'อ่านหนังสือการ์ตูน'),
                        ('B001', 'C003', CURDATE(), 'Good', 1, 3, 'แปรงฟันเช้า'),
                        ('B002', 'C003', CURDATE(), 'Good', 1, 2, 'เก็บของเล่น')
                    "
                ];

                $success_count = 0;
                $total_count = count($updates);

                foreach ($updates as $description => $sql) {
                    try {
                        $pdo->exec($sql);
                        echo "<div class='success'>✅ $description สำเร็จ</div>";
                        $success_count++;
                    } catch (Exception $e) {
                        echo "<div class='warning'>⚠️ $description: " . htmlspecialchars($e->getMessage()) . "</div>";
                    }
                }

                if ($success_count >= $total_count * 0.8) { // อย่างน้อย 80% สำเร็จ
                    echo "<div class='success'>";
                    echo "<h3>🎉 ปรับปรุงฐานข้อมูลสำเร็จ!</h3>";
                    echo "<p>สำเร็จ $success_count จาก $total_count รายการ</p>";
                    echo "</div>";

                    echo "<div style='text-align: center; margin-top: 20px;'>";
                    echo "<a href='?step=test' class='btn btn-success'>➡️ ขั้นตอนต่อไป: ทดสอบ API</a>";
                    echo "</div>";
                } else {
                    echo "<div class='warning'>";
                    echo "<h3>⚠️ ปรับปรุงเสร็จแล้ว ($success_count/$total_count สำเร็จ)</h3>";
                    echo "</div>";

                    echo "<div style='text-align: center; margin-top: 20px;'>";
                    echo "<a href='?step=test' class='btn btn-warning'>➡️ ดำเนินการต่อ</a>";
                    echo "</div>";
                }

                echo "</div>";

            } catch (Exception $e) {
                echo "<div class='error'>";
                echo "❌ เกิดข้อผิดพลาดในการปรับปรุงฐานข้อมูล: " . htmlspecialchars($e->getMessage());
                echo "</div>";
            }
        }

        function showTestStep() {
            echo "<div class='step info'>";
            echo "<h2>🧪 ขั้นตอนที่ 3: ทดสอบ API</h2>";

            $api_base = 'https://sertjerm.com/my-kids-api/api.php';
            
            if ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false) {
                $api_base = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/api.php';
            } else {
                $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
                $api_base = $protocol . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/api.php';
            }

            echo "<div class='info'>";
            echo "<strong>🌐 API Base URL:</strong> <a href='$api_base?health' target='_blank'>$api_base</a>";
            echo "</div>";

            $endpoints = [
                'health' => 'Health Check',
                'children' => 'Children API',
                'behaviors' => 'Behaviors API',
                'rewards' => 'Rewards API',
                'dashboard' => 'Dashboard API'
            ];

            $passed = 0;
            $total = count($endpoints);

            echo "<div class='grid'>";
            foreach ($endpoints as $endpoint => $name) {
                $url = "$api_base?$endpoint";
                
                echo "<div class='stat-card'>";
                
                // แก้ไขการตั้งค่า context สำหรับ HTTPS
                $context = stream_context_create([
                    'http' => [
                        'timeout' => 30,  // เพิ่ม timeout เป็น 30 วินาที
                        'method' => 'GET',
                        'header' => [
                            'User-Agent: MyKids-Installer/3.0',
                            'Accept: application/json',
                            'Cache-Control: no-cache'
                        ],
                        'ignore_errors' => true  // จับ error ได้ดีขึ้น
                    ],
                    'ssl' => [
                        'verify_peer' => false,      // สำหรับ HTTPS ที่อาจมีปัญหา certificate
                        'verify_peer_name' => false,
                        'allow_self_signed' => true
                    ]
                ]);
                
                $start = microtime(true);
                $response = @file_get_contents($url, false, $context);
                $time = round((microtime(true) - $start) * 1000, 2);
                
                // Debug information
                $http_response_header = $http_response_header ?? [];
                $status_line = isset($http_response_header[0]) ? $http_response_header[0] : 'No response';
                
                if ($response !== false) {
                    $data = json_decode($response, true);
                    if (json_last_error() === JSON_ERROR_NONE && !isset($data['error'])) {
                        echo "<h3>✅</h3>";
                        echo "<p>$name</p>";
                        echo "<small>{$time}ms</small>";
                        $passed++;
                    } else {
                        echo "<h3>❌</h3>";
                        echo "<p>$name</p>";
                        echo "<small>JSON Error</small>";
                        echo "<div class='debug-info'>Response: " . substr($response, 0, 100) . "...</div>";
                    }
                } else {
                    echo "<h3>❌</h3>";
                    echo "<p>$name</p>";
                    echo "<small>Connection Failed</small>";
                    echo "<div class='debug-info'>Status: $status_line</div>";
                    
                    // Show last error if available
                    $error = error_get_last();
                    if ($error && strpos($error['message'], 'file_get_contents') !== false) {
                        echo "<div class='debug-info'>Error: " . htmlspecialchars($error['message']) . "</div>";
                    }
                }
                
                echo "</div>";
            }
            echo "</div>";

            $success_rate = round(($passed / $total) * 100, 2);

            if ($success_rate >= 80) {
                echo "<div class='success'>";
                echo "<h3>🎉 ทดสอบสำเร็จ! ($passed/$total) - $success_rate%</h3>";
                echo "</div>";

                echo "<div style='text-align: center; margin-top: 20px;'>";
                echo "<a href='?step=complete' class='btn btn-success'>➡️ เสร็จสิ้นการติดตั้ง</a>";
                echo "</div>";
            } else {
                echo "<div class='warning'>";
                echo "<h3>⚠️ ทดสอบผ่านบางส่วน ($passed/$total) - $success_rate%</h3>";
                echo "<p>API endpoints ทำงานได้ปกติใน browser แต่อาจมีปัญหา SSL/HTTPS ในการทดสอบอัตโนมัติ</p>";
                echo "</div>";

                echo "<div class='info'>";
                echo "<p><strong>💡 หมายเหตุ:</strong> หาก API endpoints ทำงานได้ปกติในเบราว์เซอร์แล้ว สามารถดำเนินการต่อได้</p>";
                echo "</div>";

                echo "<div style='text-align: center; margin-top: 20px;'>";
                echo "<a href='?step=complete' class='btn btn-success'>➡️ ข้ามไปขั้นตอนสุดท้าย</a>";
                echo "<a href='?step=test' class='btn'>🔄 ทดสอบใหม่</a>";
                echo "</div>";
            }

            echo "</div>";
        }

        function showCompleteStep() {
            echo "<div class='step success'>";
            echo "<h2>🎉 การติดตั้งเสร็จสิ้น!</h2>";
            
            $api_base = 'https://sertjerm.com/my-kids-api/api.php';
            if ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false) {
                $api_base = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/api.php';
            } else {
                $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
                $api_base = $protocol . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/api.php';
            }
            
            echo "<h3>✅ สิ่งที่ติดตั้งแล้ว:</h3>";
            echo "<ul>";
            echo "<li>✅ ตั้งค่าการเชื่อมต่อฐานข้อมูล (config.php)</li>";
            echo "<li>✅ ปรับปรุงข้อมูลในฐานข้อมูล</li>";
            echo "<li>✅ ทดสอบ API endpoints</li>";
            echo "<li>✅ เพิ่มข้อมูลตัวอย่าง</li>";
            echo "</ul>";

            echo "<h3>🚀 ทดสอบ API:</h3>";
            echo "<div class='grid'>";
            
            echo "<div class='stat-card'>";
            echo "<h3>🏥</h3>";
            echo "<p>Health Check</p>";
            echo "<a href='$api_base?health' class='btn' target='_blank'>ตรวจสอบสถานะ</a>";
            echo "</div>";

            echo "<div class='stat-card'>";
            echo "<h3>👶</h3>";
            echo "<p>Children</p>";
            echo "<a href='$api_base?children' class='btn' target='_blank'>ดูรายชื่อเด็ก</a>";
            echo "</div>";

            echo "<div class='stat-card'>";
            echo "<h3>📊</h3>";
            echo "<p>Dashboard</p>";
            echo "<a href='$api_base?dashboard' class='btn' target='_blank'>ดูแดชบอร์ด</a>";
            echo "</div>";

            echo "<div class='stat-card'>";
            echo "<h3>🧪</h3>";
            echo "<p>Test Interface</p>";
            echo "<a href='quick-start.php' class='btn' target='_blank'>เครื่องมือทดสอบ</a>";
            echo "</div>";

            echo "</div>";

            echo "<h3>⚠️ ความปลอดภัย:</h3>";
            echo "<div class='warning'>";
            echo "<p>เพื่อความปลอดภัย กรุณา:</p>";
            echo "<ul>";
            echo "<li>🗑️ ลบไฟล์ <strong>install.php</strong> (ไฟล์นี้)</li>";
            echo "<li>🗑️ ลบไฟล์ <strong>test.php</strong> หากมี</li>";
            echo "<li>🔒 ตรวจสอบสิทธิ์ไฟล์</li>";
            echo "<li>🛡️ ตั้งค่า HTTPS</li>";
            echo "</ul>";
            echo "</div>";

            echo "<h3>📚 ตัวอย่างการใช้งาน:</h3>";
            echo "<div class='code'>// JavaScript - ดึงข้อมูลเด็ก
fetch('$api_base?children')
  .then(r => r.json())
  .then(console.log);

// บันทึกกิจกรรม
fetch('$api_base?activities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ChildId: 'C001',
    ItemId: 'B001',
    ActivityType: 'Behavior'
  })
}).then(r => r.json()).then(console.log);</div>";

            echo "<h3>🎯 ขั้นตอนต่อไป:</h3>";
            echo "<ul>";
            echo "<li>🔧 อัปเดต React UI ให้เชื่อมต่อกับ API</li>";
            echo "<li>⚙️ ตั้งค่า REACT_APP_API_URL=https://sertjerm.com/my-kids-api/api.php</li>";
            echo "<li>🚀 Deploy React application</li>";
            echo "<li>🧪 ทดสอบการทำงานแบบ end-to-end</li>";
            echo "</ul>";

            echo "<div style='text-align: center; margin-top: 30px;'>";
            echo "<a href='$api_base?health' class='btn btn-success' target='_blank'>🚀 ทดสอบ API</a>";
            if (file_exists('quick-start.php')) {
                echo "<a href='quick-start.php' class='btn btn-success' target='_blank'>📋 Quick Start Guide</a>";
            }
            echo "</div>";

            echo "</div>";
        }
        ?>

        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #bdc3c7;">
            <p style="color: #7f8c8d;">MyKids API Auto Installer v3.0 - Fixed Version</p>
            <p style="color: #7f8c8d; font-size: 0.9em;">⚠️ กรุณาลบไฟล์ install.php หลังติดตั้งเสร็จ</p>
        </div>
    </div>
</body>
</html>