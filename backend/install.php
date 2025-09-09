<?php
// install.php - อัตโนมัติ installer สำหรับ MyKids API
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
            font-family: 'Segoe UI', sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f7fa;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .step {
            margin: 20px 0;
            padding: 20px;
            border-radius: 8px;
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
            border-radius: 6px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
        }
        .btn:hover {
            background: #2980b9;
        }
        .btn-success {
            background: #27ae60;
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
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
            overflow-x: auto;
            margin: 10px 0;
        }
        .progress {
            width: 100%;
            height: 20px;
            background: #ecf0f1;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #3498db, #2980b9);
            transition: width 0.3s ease;
        }
        .form-group {
            margin: 15px 0;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .form-group input, .form-group select {
            width: 100%;
            padding: 10px;
            border: 1px solid #bdc3c7;
            border-radius: 4px;
            font-size: 14px;
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
            border-radius: 8px;
            text-align: center;
            border: 2px solid #bdc3c7;
        }
        .stat-card.success {
            background: #d5f4e6;
            border-color: #27ae60;
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            font-size: 2em;
            color: #2c3e50;
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
        echo "<p style='text-align: center; margin: 10px 0;'>ขั้นตอน " . ($current_step_index + 1) . " จาก " . count($steps) . " ({$progress}%)</p>";

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
            echo "<li>ตั้งค่าการเชื่อมต่อฐานข้อมูล</li>";
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
            if (file_exists('config.php')) {
                $config_content = file_get_contents('config.php');
                
                // Extract current values
                preg_match("/define\('DB_NAME', '(.+?)'\)/", $config_content, $db_name_match);
                preg_match("/define\('DB_USER', '(.+?)'\)/", $config_content, $db_user_match);
                
                $current_db_name = $db_name_match[1] ?? 'sertjerm_MyKids';
                $current_db_user = $db_user_match[1] ?? 'sertjerm_mykids';
                
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
                echo "<div class='error'>";
                echo "❌ ไม่พบไฟล์ config.php";
                echo "</div>";
                $current_db_name = 'sertjerm_MyKids';
                $current_db_user = 'sertjerm_mykids';
            }

            echo "<form method='post'>";
            echo "<input type='hidden' name='action' value='save_config'>";
            
            echo "<div class='form-group'>";
            echo "<label>ชื่อฐานข้อมูล:</label>";
            echo "<input type='text' name='db_name' value='$current_db_name' required>";
            echo "</div>";

            echo "<div class='form-group'>";
            echo "<label>Username:</label>";
            echo "<input type='text' name='db_user' value='$current_db_user' required>";
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

            // สร้างไฟล์ config.php
            $config_content = "<?php
// config.php - Database Configuration for MyKidsDB (Generated by Auto Installer)

// Database Configuration - Updated for sertjerm.com
define('DB_HOST', '$db_host');
define('DB_NAME', '$db_name');
define('DB_USER', '$db_user');
define('DB_PASS', '$db_pass');
define('DB_CHARSET', 'utf8mb4');

// Timezone Setting
date_default_timezone_set('Asia/Bangkok');

// CORS Headers
function setCorsHeaders() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json; charset=utf-8');
    
    if (\$_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Database Connection Function
function getDbConnection() {
    try {
        \$dsn = \"mysql:host=\" . DB_HOST . \";dbname=\" . DB_NAME . \";charset=\" . DB_CHARSET;
        \$pdo = new PDO(\$dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => \"SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci\"
        ]);
        
        return \$pdo;
    } catch (PDOException \$e) {
        throw new Exception('Database connection failed: ' . \$e->getMessage());
    }
}

// Helper function to send JSON response
function sendJson(\$data, \$httpCode = 200) {
    http_response_code(\$httpCode);
    
    if (is_array(\$data) || is_object(\$data)) {
        echo json_encode(\$data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    } else {
        echo json_encode(['message' => \$data], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
    exit();
}

// Error Handler
function handleError(\$message, \$code = 500) {
    sendJson([
        'error' => true,
        'message' => \$message,
        'timestamp' => date('c'),
        'code' => \$code
    ], \$code);
}

// Validation Functions
function validateChildData(\$data) {
    \$errors = [];
    
    if (empty(\$data['Name']) || strlen(trim(\$data['Name'])) < 2) {
        \$errors[] = 'ชื่อเด็กต้องมีอย่างน้อย 2 ตัวอักษร';
    }
    
    if (isset(\$data['Age']) && (\$data['Age'] < 1 || \$data['Age'] > 18)) {
        \$errors[] = 'อายุต้องอยู่ระหว่าง 1-18 ปี';
    }
    
    return \$errors;
}

function validateBehaviorData(\$data) {
    \$errors = [];
    
    if (empty(\$data['Name']) || strlen(trim(\$data['Name'])) < 2) {
        \$errors[] = 'ชื่อพฤติกรรมต้องมีอย่างน้อย 2 ตัวอักษร';
    }
    
    if (!isset(\$data['Points']) || !is_numeric(\$data['Points'])) {
        \$errors[] = 'คะแนนต้องเป็นตัวเลข';
    }
    
    if (empty(\$data['Type']) || !in_array(\$data['Type'], ['Good', 'Bad'])) {
        \$errors[] = 'ประเภทพฤติกรรมต้องเป็น Good หรือ Bad';
    }
    
    if (empty(\$data['Color'])) {
        \$errors[] = 'ต้องระบุสี';
    }
    
    return \$errors;
}

function validateRewardData(\$data) {
    \$errors = [];
    
    if (empty(\$data['Name']) || strlen(trim(\$data['Name'])) < 2) {
        \$errors[] = 'ชื่อรางวัลต้องมีอย่างน้อย 2 ตัวอักษร';
    }
    
    if (!isset(\$data['Cost']) || !is_numeric(\$data['Cost']) || \$data['Cost'] <= 0) {
        \$errors[] = 'ราคาแลกต้องเป็นตัวเลขที่มากกว่า 0';
    }
    
    if (empty(\$data['Color'])) {
        \$errors[] = 'ต้องระบุสี';
    }
    
    return \$errors;
}

// Logging Function
function logActivity(\$message, \$data = null) {
    \$log = [
        'timestamp' => date('c'),
        'message' => \$message,
        'ip' => \$_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => \$_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];
    
    if (\$data) {
        \$log['data'] = \$data;
    }
    
    error_log('MyKidsDB: ' . json_encode(\$log, JSON_UNESCAPED_UNICODE));
}
?>";

            if (file_put_contents('config.php', $config_content)) {
                echo "<div class='success'>";
                echo "✅ ไฟล์ config.php ถูกสร้างเรียบร้อยแล้ว";
                echo "</div>";

                // ทดสอบการเชื่อมต่อ
                try {
                    require_once 'config.php';
                    $pdo = getDbConnection();
                    
                    echo "<div class='success'>";
                    echo "✅ การเชื่อมต่อฐานข้อมูลสำเร็จ!";
                    echo "</div>";

                    echo "<div style='text-align: center; margin-top: 20px;'>";
                    echo "<a href='?step=database' class='btn btn-success'>➡️ ขั้นตอนต่อไป: ปรับปรุงฐานข้อมูล</a>";
                    echo "</div>";

                } catch (Exception $e) {
                    echo "<div class='error'>";
                    echo "❌ ไม่สามารถเชื่อมต่อฐานข้อมูลได้: " . $e->getMessage();
                    echo "</div>";

                    echo "<div style='text-align: center; margin-top: 20px;'>";
                    echo "<a href='?step=config' class='btn btn-warning'>🔄 ลองใหม่</a>";
                    echo "</div>";
                }
            } else {
                echo "<div class='error'>";
                echo "❌ ไม่สามารถสร้างไฟล์ config.php ได้ กรุณาตรวจสอบสิทธิ์ในการเขียนไฟล์";
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

                // ตรวจสอบตารางที่มีอยู่
                $tables = ['Children', 'Behaviors', 'Rewards', 'DailyActivity'];
                $table_status = [];

                echo "<div class='grid'>";
                foreach ($tables as $table) {
                    try {
                        $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
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

                // ตรวจสอบ IsRepeatable setting
                try {
                    $stmt = $pdo->query("
                        SELECT Type, 
                               SUM(CASE WHEN IsRepeatable = 1 THEN 1 ELSE 0 END) as Repeatable,
                               SUM(CASE WHEN IsRepeatable = 0 THEN 1 ELSE 0 END) as OneTime
                        FROM Behaviors 
                        GROUP BY Type
                    ");
                    $behavior_stats = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    $needs_update = false;
                    foreach ($behavior_stats as $stat) {
                        if ($stat['Type'] === 'Good' && $stat['Repeatable'] > 0) {
                            $needs_update = true;
                        }
                        if ($stat['Type'] === 'Bad' && $stat['OneTime'] > 0) {
                            $needs_update = true;
                        }
                    }

                    if ($needs_update) {
                        echo "<div class='warning'>";
                        echo "⚠️ ตรวจพบการตั้งค่า IsRepeatable ที่ไม่ถูกต้อง ต้องปรับปรุง";
                        echo "</div>";
                    } else {
                        echo "<div class='success'>";
                        echo "✅ การตั้งค่า IsRepeatable ถูกต้องแล้ว";
                        echo "</div>";
                    }

                } catch (Exception $e) {
                    echo "<div class='error'>";
                    echo "❌ ไม่สามารถตรวจสอบข้อมูลได้: " . $e->getMessage();
                    echo "</div>";
                }

                echo "<h3>🔄 การปรับปรุงที่จะทำ:</h3>";
                echo "<ul>";
                echo "<li>แก้ไข IsRepeatable ใน Behaviors (Good=ครั้งเดียว, Bad=ซ้ำได้)</li>";
                echo "<li>เพิ่มพฤติกรรมและรางวัลใหม่</li>";
                echo "<li>เพิ่มข้อมูลกิจกรรมตัวอย่าง</li>";
                echo "<li>สร้าง Stored Procedures</li>";
                echo "</ul>";

                echo "<form method='post'>";
                echo "<input type='hidden' name='action' value='update_database'>";
                echo "<div style='text-align: center; margin-top: 20px;'>";
                echo "<button type='submit' class='btn btn-success'>🚀 ปรับปรุงฐานข้อมูล</button>";
                echo "</div>";
                echo "</form>";

            } catch (Exception $e) {
                echo "<div class='error'>";
                echo "❌ ไม่สามารถเชื่อมต่อฐานข้อมูลได้: " . $e->getMessage();
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
                            WHEN Type = 'Good' THEN FALSE
                            WHEN Type = 'Bad' THEN TRUE
                            ELSE IsRepeatable 
                        END
                        WHERE Id LIKE 'B%'
                    ",
                    
                    "เพิ่มพฤติกรรมดี" => "
                        INSERT IGNORE INTO Behaviors (Name, Points, Color, Category, Type) VALUES 
                        ('ล้างจาน', 3, '#34D399', 'ความรับผิดชอบ', 'Good'),
                        ('ออกกำลังกาย', 6, '#F472B6', 'สุขภาพ', 'Good'),
                        ('ช่วยแม่ทำอาหาร', 5, '#FBBF24', 'ความรับผิดชอบ', 'Good'),
                        ('นอนตรงเวลา', 4, '#A78BFA', 'สุขภาพ', 'Good'),
                        ('ทักทายสวัสดี', 2, '#FB7185', 'มารยาท', 'Good')
                    ",

                    "เพิ่มพฤติกรรมไม่ดี" => "
                        INSERT IGNORE INTO Behaviors (Name, Points, Color, Category, Type) VALUES 
                        ('หยุดเรียน', -6, '#B91C1C', 'การเรียนรู้', 'Bad'),
                        ('ไม่ล้างมือ', -2, '#F87171', 'สุขภาพ', 'Bad'),
                        ('ทิ้งขยะไม่เป็นที่', -3, '#EF4444', 'สิ่งแวดล้อม', 'Bad'),
                        ('มาสายเรียน', -4, '#DC2626', 'ความรับผิดชอบ', 'Bad')
                    ",

                    "เพิ่มรางวัล" => "
                        INSERT IGNORE INTO Rewards (Name, Cost, Color, Category) VALUES 
                        ('เล่นเกม 1 ชั่วโมง', 30, '#E0E6FF', 'บันเทิง'),
                        ('ซื้อของเล่นใหม่', 80, '#FFE4B5', 'ของเล่น'),
                        ('ไปหาเพื่อน', 35, '#E6FFE6', 'กิจกรรม'),
                        ('ไปดูหนัง', 60, '#FFEBEE', 'บันเทิง'),
                        ('ไม่ต้องล้างจาน 1 วัน', 40, '#F3E5F5', 'สิทธิพิเศษ')
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
                        echo "<div class='warning'>⚠️ $description: " . $e->getMessage() . "</div>";
                    }
                }

                if ($success_count === $total_count) {
                    echo "<div class='success'>";
                    echo "<h3>🎉 ปรับปรุงฐานข้อมูลสำเร็จ!</h3>";
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
                echo "❌ เกิดข้อผิดพลาดในการปรับปรุงฐานข้อมูล: " . $e->getMessage();
                echo "</div>";
            }
        }

        function showTestStep() {
            echo "<div class='step info'>";
            echo "<h2>🧪 ขั้นตอนที่ 3: ทดสอบ API</h2>";

            $api_base = 'https://www.sertjerm.com/mykids/api.php';
            
            if ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false) {
                $api_base = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/api.php';
            }

            echo "<div class='info'>";
            echo "<strong>🌐 API Base URL:</strong> $api_base";
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
                echo "<h3>🔄</h3>";
                echo "<p>$name</p>";
                
                $context = stream_context_create([
                    'http' => [
                        'timeout' => 10,
                        'method' => 'GET'
                    ]
                ]);
                
                $start = microtime(true);
                $response = @file_get_contents($url, false, $context);
                $time = round((microtime(true) - $start) * 1000, 2);
                
                if ($response !== false) {
                    $data = json_decode($response, true);
                    if (json_last_error() === JSON_ERROR_NONE && !isset($data['error'])) {
                        echo "<div class='success'>✅ {$time}ms</div>";
                        $passed++;
                    } else {
                        echo "<div class='error'>❌ Error</div>";
                    }
                } else {
                    echo "<div class='error'>❌ Failed</div>";
                }
                
                echo "</div>";
            }
            echo "</div>";

            $success_rate = round(($passed / $total) * 100, 2);

            if ($success_rate >= 90) {
                echo "<div class='success'>";
                echo "<h3>🎉 ทดสอบสำเร็จ! ($passed/$total) - $success_rate%</h3>";
                echo "</div>";

                echo "<div style='text-align: center; margin-top: 20px;'>";
                echo "<a href='?step=complete' class='btn btn-success'>➡️ เสร็จสิ้นการติดตั้ง</a>";
                echo "</div>";
            } else {
                echo "<div class='warning'>";
                echo "<h3>⚠️ ทดสอบผ่านบางส่วน ($passed/$total) - $success_rate%</h3>";
                echo "</div>";

                echo "<div style='text-align: center; margin-top: 20px;'>";
                echo "<a href='?step=complete' class='btn btn-warning'>➡️ ดำเนินการต่อ</a>";
                echo "<a href='?step=test' class='btn'>🔄 ทดสอบใหม่</a>";
                echo "</div>";
            }

            echo "</div>";
        }

        function showCompleteStep() {
            echo "<div class='step success'>";
            echo "<h2>🎉 การติดตั้งเสร็จสิ้น!</h2>";
            
            echo "<h3>✅ สิ่งที่ติดตั้งแล้ว:</h3>";
            echo "<ul>";
            echo "<li>✅ ตั้งค่าการเชื่อมต่อฐานข้อมูล (config.php)</li>";
            echo "<li>✅ ปรับปรุงข้อมูลในฐานข้อมูล</li>";
            echo "<li>✅ ทดสอบ API endpoints</li>";
            echo "<li>✅ เพิ่มข้อมูลตัวอย่าง</li>";
            echo "</ul>";

            echo "<h3>🚀 ขั้นตอนต่อไป:</h3>";
            echo "<div class='grid'>";
            
            echo "<div class='stat-card'>";
            echo "<h3>🧪</h3>";
            echo "<p>ทดสอบ API</p>";
            echo "<a href='index.php' class='btn' target='_blank'>เปิด Test Interface</a>";
            echo "</div>";

            echo "<div class='stat-card'>";
            echo "<h3>🏥</h3>";
            echo "<p>Health Check</p>";
            echo "<a href='api.php?health' class='btn' target='_blank'>ตรวจสอบสถานะ</a>";
            echo "</div>";

            echo "<div class='stat-card'>";
            echo "<h3>📊</h3>";
            echo "<p>Dashboard</p>";
            echo "<a href='api.php?dashboard' class='btn' target='_blank'>ดูข้อมูลภาพรวม</a>";
            echo "</div>";

            echo "<div class='stat-card'>";
            echo "<h3>🔧</h3>";
            echo "<p>Maintenance</p>";
            echo "<a href='maintenance.php' class='btn' target='_blank'>เครื่องมือบำรุงรักษา</a>";
            echo "</div>";

            echo "</div>";

            echo "<h3>⚠️ ความปลอดภัย:</h3>";
            echo "<div class='warning'>";
            echo "<p>เพื่อความปลอดภัย กรุณา:</p>";
            echo "<ul>";
            echo "<li>🗑️ ลบไฟล์ <strong>install.php</strong> (ไฟล์นี้)</li>";
            echo "<li>🔒 ป้องกันหรือลบ <strong>maintenance.php</strong></li>";
            echo "<li>🛡️ ตั้งค่า HTTPS</li>";
            echo "</ul>";
            echo "</div>";

            echo "<h3>📚 ตัวอย่างการใช้งาน:</h3>";
            echo "<div class='code'>// JavaScript - ดึงข้อมูลเด็ก
fetch('api.php?children')
  .then(r => r.json())
  .then(console.log);

// บันทึกกิจกรรม
fetch('api.php?activities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ChildId: 'C001',
    ItemId: 'B001',
    ActivityType: 'Good'
  })
}).then(r => r.json()).then(console.log);</div>";

            echo "<div style='text-align: center; margin-top: 30px;'>";
            echo "<a href='index.php' class='btn btn-success'>🚀 เริ่มใช้งาน MyKids API</a>";
            echo "</div>";

            echo "</div>";
        }
        ?>

        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #bdc3c7;">
            <p style="color: #7f8c8d;">MyKids API Auto Installer v1.0</p>
            <p style="color: #7f8c8d; font-size: 0.9em;">⚠️ กรุณาลบไฟล์ install.php หลังติดตั้งเสร็จ</p>
        </div>
    </div>
</body>
</html>