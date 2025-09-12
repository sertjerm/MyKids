<?php
// quick-start.php - ทดสอบเร็วสำหรับ MyKids API v3.0
// ไฟล์นี้ใช้สำหรับทดสอบ API ทันทีหลังติดตั้ง

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyKids API Quick Start</title>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            max-width: 1200px;
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
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            margin: -30px -30px 30px -30px;
            padding: 30px;
            border-radius: 15px 15px 0 0;
            border-bottom: none;
        }
        .status-card {
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid;
        }
        .success {
            background: #d4edda;
            border-left-color: #28a745;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            border-left-color: #dc3545;
            color: #721c24;
        }
        .warning {
            background: #fff3cd;
            border-left-color: #ffc107;
            color: #856404;
        }
        .info {
            background: #d1ecf1;
            border-left-color: #17a2b8;
            color: #0c5460;
        }
        .code {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
            overflow-x: auto;
            font-size: 0.9em;
            border: 1px solid #34495e;
        }
        .btn {
            background: #007bff;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin: 5px;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s;
            font-size: 14px;
        }
        .btn:hover {
            background: #0056b3;
            transform: translateY(-2px);
        }
        .btn-success {
            background: #28a745;
        }
        .btn-success:hover {
            background: #1e7e34;
        }
        .btn-warning {
            background: #ffc107;
            color: #212529;
        }
        .btn-danger {
            background: #dc3545;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #e9ecef;
            text-align: center;
        }
        .stat-card.success {
            background: #d5f4e6;
            border-color: #27ae60;
        }
        .stat-card.error {
            background: #fadbd8;
            border-color: #e74c3c;
        }
        h1, h2, h3 { margin-bottom: 15px; }
        ul { margin-left: 20px; }
        li { margin: 8px 0; }
        .api-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
            margin: 10px 0;
        }
        .endpoint-test {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
            margin: 5px 0;
        }
        .test-result {
            font-weight: bold;
            padding: 5px 10px;
            border-radius: 3px;
        }
        .test-result.success {
            background: #d4edda;
            color: #155724;
        }
        .test-result.error {
            background: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 MyKids API Quick Start</h1>
            <p>ทดสอบเร็วเพื่อตรวจสอบว่าระบบทำงานถูกต้อง</p>
            <p><strong>Version 3.0</strong></p>
        </div>

        <?php
        // แก้ไข API Base URL ให้ถูกต้อง
        $api_base = 'https://sertjerm.com/my-kids-api/api.php';
        
        // สำหรับ localhost
        if ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false) {
            $api_base = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/api.php';
        } else {
            // Auto-detect protocol และ path
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
            $current_path = dirname($_SERVER['REQUEST_URI']);
            $api_base = $protocol . '://' . $_SERVER['HTTP_HOST'] . $current_path . '/api.php';
        }

        echo "<div class='api-info'>";
        echo "<strong>🌐 API Base URL:</strong> <a href='$api_base' target='_blank'>$api_base</a>";
        echo "<br><strong>📁 Current Path:</strong> " . __DIR__;
        echo "<br><strong>🕒 Test Time:</strong> " . date('Y-m-d H:i:s');
        echo "</div>";

        // Test 1: Environment Check
        echo "<h2>1️⃣ ตรวจสอบสภาพแวดล้อม</h2>";
        
        echo "<div class='grid'>";
        
        // PHP Version
        echo "<div class='stat-card " . (version_compare(PHP_VERSION, '7.4.0', '>=') ? 'success' : 'error') . "'>";
        echo "<h3>🐘 PHP</h3>";
        echo "<p>Version: " . PHP_VERSION . "</p>";
        echo "<p>" . (version_compare(PHP_VERSION, '7.4.0', '>=') ? '✅ Compatible' : '❌ Needs 7.4+') . "</p>";
        echo "</div>";
        
        // File Permissions
        $files_ok = true;
        $required_files = ['config.php', 'api.php'];
        foreach ($required_files as $file) {
            if (!file_exists($file)) {
                $files_ok = false;
                break;
            }
        }
        
        echo "<div class='stat-card " . ($files_ok ? 'success' : 'error') . "'>";
        echo "<h3>📁 Files</h3>";
        echo "<p>Required files</p>";
        echo "<p>" . ($files_ok ? '✅ All Present' : '❌ Missing Files') . "</p>";
        echo "</div>";
        
        echo "</div>";

        // Test 2: Config File Check
        echo "<h2>2️⃣ ตรวจสอบไฟล์ Config</h2>";
        
        if (file_exists('config.php')) {
            echo "<div class='success'>✅ ไฟล์ config.php พบแล้ว</div>";
            
            // ตรวจสอบว่ามีการแก้ไขรหัสผ่านหรือไม่
            $config_content = file_get_contents('config.php');
            if (strpos($config_content, 'your_actual_password_here') !== false) {
                echo "<div class='warning'>⚠️ กรุณาแก้ไขรหัสผ่านใน config.php</div>";
            } else {
                echo "<div class='success'>✅ รหัสผ่านถูกแก้ไขแล้ว</div>";
            }
            
            // ตรวจสอบค่า constants
            try {
                require_once 'config.php';
                echo "<div class='success'>✅ โหลด config.php สำเร็จ</div>";
                
                if (defined('DB_NAME')) {
                    echo "<div class='info'>📊 Database: " . DB_NAME . "</div>";
                }
                if (defined('API_VERSION')) {
                    echo "<div class='info'>🔧 API Version: " . API_VERSION . "</div>";
                }
            } catch (Exception $e) {
                echo "<div class='error'>❌ Error loading config: " . htmlspecialchars($e->getMessage()) . "</div>";
            }
        } else {
            echo "<div class='error'>❌ ไม่พบไฟล์ config.php - กรุณารันไฟล์ install.php ก่อน</div>";
        }

        // Test 3: Database Connection
        echo "<h2>3️⃣ ทดสอบการเชื่อมต่อฐานข้อมูล</h2>";
        
        $db_ok = false;
        try {
            if (function_exists('getDbConnection')) {
                $pdo = getDbConnection();
                echo "<div class='success'>✅ เชื่อมต่อฐานข้อมูลสำเร็จ</div>";
                $db_ok = true;
                
                // ตรวจสอบตาราง
                $tables = ['Children', 'Behaviors', 'Rewards', 'DailyActivity'];
                echo "<div class='grid'>";
                foreach ($tables as $table) {
                    try {
                        $stmt = $pdo->query("SELECT COUNT(*) as count FROM `$table`");
                        $count = $stmt->fetch()['count'];
                        echo "<div class='stat-card success'>";
                        echo "<h3>$count</h3>";
                        echo "<p>$table</p>";
                        echo "</div>";
                    } catch (Exception $e) {
                        echo "<div class='stat-card error'>";
                        echo "<h3>❌</h3>";
                        echo "<p>$table</p>";
                        echo "<small>" . htmlspecialchars($e->getMessage()) . "</small>";
                        echo "</div>";
                    }
                }
                echo "</div>";
            } else {
                echo "<div class='error'>❌ ฟังก์ชัน getDbConnection ไม่พบ</div>";
            }
        } catch (Exception $e) {
            echo "<div class='error'>❌ ไม่สามารถเชื่อมต่อฐานข้อมูล: " . htmlspecialchars($e->getMessage()) . "</div>";
        }

        // Test 4: API Endpoints
        echo "<h2>4️⃣ ทดสอบ API Endpoints</h2>";

        function testEndpoint($url, $name) {
            $start = microtime(true);
            
            // แก้ไข context สำหรับ HTTPS เหมือนใน install.php
            $context = stream_context_create([
                'http' => [
                    'timeout' => 20,
                    'method' => 'GET',
                    'header' => [
                        'User-Agent: MyKids-QuickStart/3.0',
                        'Accept: application/json',
                        'Cache-Control: no-cache'
                    ],
                    'ignore_errors' => true
                ],
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                ]
            ]);
            
            try {
                $response = @file_get_contents($url, false, $context);
                $time = round((microtime(true) - $start) * 1000, 2);
                
                if ($response === false) {
                    return ['success' => false, 'message' => 'ไม่สามารถเข้าถึงได้', 'time' => $time];
                }
                
                $data = json_decode($response, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    return ['success' => false, 'message' => 'JSON ไม่ถูกต้อง', 'time' => $time, 'response' => substr($response, 0, 100)];
                }
                
                if (isset($data['error'])) {
                    return ['success' => false, 'message' => $data['error'], 'time' => $time];
                }
                
                return ['success' => true, 'message' => 'สำเร็จ', 'time' => $time, 'data' => $data];
                
            } catch (Exception $e) {
                return ['success' => false, 'message' => $e->getMessage(), 'time' => 0];
            }
        }

        $endpoints = [
            'health' => 'Health Check',
            'children' => 'Children API',
            'behaviors' => 'Behaviors API', 
            'good-behaviors' => 'Good Behaviors',
            'bad-behaviors' => 'Bad Behaviors',
            'rewards' => 'Rewards API',
            'dashboard' => 'Dashboard API'
        ];

        $passed = 0;
        $total = count($endpoints);

        foreach ($endpoints as $endpoint => $name) {
            $result = testEndpoint("$api_base?$endpoint", $name);
            
            echo "<div class='endpoint-test'>";
            echo "<span><strong>$name</strong> ($endpoint)</span>";
            if ($result['success']) {
                echo "<span class='test-result success'>✅ {$result['message']} ({$result['time']}ms)</span>";
                $passed++;
            } else {
                echo "<span class='test-result error'>❌ {$result['message']} ({$result['time']}ms)</span>";
            }
            echo "</div>";
            
            // แสดงข้อมูลตัวอย่างสำหรับ health check
            if ($endpoint === 'health' && $result['success'] && isset($result['data'])) {
                echo "<div class='info'>";
                echo "<strong>Health Check Response:</strong><br>";
                echo "Status: " . ($result['data']['status'] ?? 'Unknown') . "<br>";
                echo "Version: " . ($result['data']['version'] ?? 'Unknown') . "<br>";
                echo "Children Count: " . ($result['data']['children_count'] ?? 'Unknown');
                echo "</div>";
            }
        }

        echo "<h2>5️⃣ สรุปผลการทดสอบ</h2>";

        $success_rate = round(($passed / $total) * 100, 2);

        if ($success_rate >= 90) {
            echo "<div class='success'>";
            echo "<h3>🎉 ยอดเยี่ยม! ระบบพร้อมใช้งาน</h3>";
            echo "<p>ผ่านการทดสอบ $passed/$total ($success_rate%)</p>";
            echo "</div>";
        } elseif ($success_rate >= 70) {
            echo "<div class='warning'>";
            echo "<h3>⚠️ ใช้งานได้ แต่มีปัญหาบางอย่าง</h3>";
            echo "<p>ผ่านการทดสอบ $passed/$total ($success_rate%)</p>";
            echo "</div>";
        } else {
            echo "<div class='error'>";
            echo "<h3>❌ ต้องแก้ไขปัญหาก่อนใช้งาน</h3>";
            echo "<p>ผ่านการทดสอบ $passed/$total ($success_rate%)</p>";
            echo "</div>";
        }

        ?>

        <h2>6️⃣ ขั้นตอนต่อไป</h2>

        <?php if ($success_rate >= 80): ?>
            <div class="success">
                <h4>🚀 ระบบพร้อมใช้งาน!</h4>
                <p>คุณสามารถ:</p>
                <ul>
                    <li>เริ่มพัฒนา React Frontend ที่เชื่อมต่อกับ API</li>
                    <li>ใช้ API endpoints ในแอปพลิเคชันของคุณ</li>
                    <li>ลบไฟล์ install.php และ quick-start.php เพื่อความปลอดภัย</li>
                </ul>
            </div>
        <?php else: ?>
            <div class="warning">
                <h4>🔧 การแก้ไขปัญหา</h4>
                <ul>
                    <li><strong>Config Error:</strong> ตรวจสอบ config.php และการตั้งค่าฐานข้อมูล</li>
                    <li><strong>Database Error:</strong> ตรวจสอบรหัสผ่านและสิทธิ์การเข้าถึง</li>
                    <li><strong>API Error:</strong> ตรวจสอบไฟล์ api.php และ .htaccess</li>
                    <li><strong>Permission Error:</strong> ตรวจสอบสิทธิ์ไฟล์ (644) และโฟลเดอร์ (755)</li>
                </ul>
                
                <p><strong>หากต้องการติดตั้งใหม่:</strong></p>
                <a href="install.php" class="btn btn-warning">🔄 เริ่มการติดตั้งใหม่</a>
            </div>
        <?php endif; ?>

        <h2>7️⃣ ตัวอย่าง API Calls</h2>
        
        <h4>JavaScript (Browser):</h4>
        <div class="code">// ดึงข้อมูลเด็กทั้งหมด
fetch('<?php echo $api_base; ?>?children')
  .then(response => response.json())
  .then(data => {
    console.log('Children:', data);
  })
  .catch(error => console.error('Error:', error));

// บันทึกกิจกรรม
fetch('<?php echo $api_base; ?>?activities', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    ChildId: 'C001',
    ItemId: 'B001',
    ActivityType: 'Behavior',
    Count: 1,
    Note: 'ทดสอบจาก Quick Start'
  })
})
.then(response => response.json())
.then(data => console.log('Activity recorded:', data))
.catch(error => console.error('Error:', error));</div>

        <h4>React Component Example:</h4>
        <div class="code">// React Hook สำหรับดึงข้อมูลเด็ก
import { useState, useEffect } from 'react';

const useChildren = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('<?php echo $api_base; ?>?children')
      .then(response => response.json())
      .then(data => {
        setChildren(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { children, loading, error };
};</div>

        <h4>cURL (Command Line):</h4>
        <div class="code"># Health Check
curl -X GET "<?php echo $api_base; ?>?health" \
  -H "Accept: application/json"

# Get Children
curl -X GET "<?php echo $api_base; ?>?children" \
  -H "Accept: application/json"

# Get Behaviors  
curl -X GET "<?php echo $api_base; ?>?behaviors" \
  -H "Accept: application/json"

# Record Activity
curl -X POST "<?php echo $api_base; ?>?activities" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "ChildId": "C001",
    "ItemId": "B001", 
    "ActivityType": "Behavior",
    "Count": 1,
    "Note": "Test from cURL"
  }'</div>

        <h2>8️⃣ ข้อมูลระบบ</h2>
        <div class="info">
            <strong>🕒 เวลาปัจจุบัน:</strong> <?php echo date('Y-m-d H:i:s T'); ?><br>
            <strong>🌐 Server:</strong> <?php echo $_SERVER['HTTP_HOST']; ?><br>
            <strong>🐘 PHP Version:</strong> <?php echo PHP_VERSION; ?><br>
            <strong>📁 Document Root:</strong> <?php echo $_SERVER['DOCUMENT_ROOT']; ?><br>
            <strong>📂 Current Directory:</strong> <?php echo __DIR__; ?><br>
            <strong>🔧 API Base:</strong> <?php echo $api_base; ?><br>
            <?php if (defined('API_VERSION')): ?>
            <strong>📊 API Version:</strong> <?php echo API_VERSION; ?><br>
            <?php endif; ?>
            <?php if (defined('DB_NAME')): ?>
            <strong>🗃️ Database:</strong> <?php echo DB_NAME; ?><br>
            <?php endif; ?>
        </div>

        <h2>9️⃣ Quick Actions</h2>
        <div style="text-align: center; margin: 30px 0;">
            <a href="<?php echo $api_base; ?>?health" class="btn btn-success" target="_blank">🏥 Health Check</a>
            <a href="<?php echo $api_base; ?>?children" class="btn btn-success" target="_blank">👶 View Children</a>
            <a href="<?php echo $api_base; ?>?behaviors" class="btn btn-success" target="_blank">📋 View Behaviors</a>
            <a href="<?php echo $api_base; ?>?dashboard" class="btn btn-success" target="_blank">📊 Dashboard</a>
            <br><br>
            <?php if (file_exists('install.php')): ?>
            <a href="install.php" class="btn btn-warning">⚙️ Installer</a>
            <?php endif; ?>
            <a href="?" class="btn">🔄 Refresh Test</a>
        </div>

        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d;">MyKids API Quick Start v3.0</p>
            <p style="color: #6c757d; font-size: 0.9em;">🗑️ ลบไฟล์นี้หลังจากทดสอบเสร็จแล้ว</p>
        </div>
    </div>
</body>
</html>