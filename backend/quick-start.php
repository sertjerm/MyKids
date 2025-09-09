<?php
// quick-start.php - ทดสอบเร็วสำหรับ MyKids API
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
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f0f2f5;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            border: 1px solid #e9ecef;
            white-space: pre-wrap;
        }
        .btn {
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
            text-decoration: none;
            display: inline-block;
        }
        .btn:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 MyKids API Quick Start</h1>
        <p>ทดสอบเร็วเพื่อตรวจสอบว่าระบบทำงานถูกต้อง</p>

        <?php
        $api_base = 'https://www.sertjerm.com/mykids/api.php';
        
        // หรือใช้ localhost สำหรับทดสอบ
        if ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false) {
            $api_base = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/api.php';
        }

        echo "<div class='info'>";
        echo "<strong>🌐 API Base URL:</strong> $api_base";
        echo "</div>";

        // Test 1: Config File Check
        echo "<h2>1️⃣ ตรวจสอบไฟล์ Config</h2>";
        
        if (file_exists('config.php')) {
            echo "<div class='success'>✅ ไฟล์ config.php พบแล้ว</div>";
            
            // ตรวจสอบว่ามีการแก้ไขรหัสผ่านหรือไม่
            $config_content = file_get_contents('config.php');
            if (strpos($config_content, 'your_actual_password_here') !== false) {
                echo "<div class='warning'>⚠️ กรุณาแก้ไขรหัสผ่านใน config.php</div>";
            } else {
                echo "<div class='success'>✅ รหัสผ่านถูกแก้ไขแล้ว</div>";
            }
        } else {
            echo "<div class='error'>❌ ไม่พบไฟล์ config.php</div>";
        }

        // Test 2: Database Connection
        echo "<h2>2️⃣ ทดสอบการเชื่อมต่อฐานข้อมูล</h2>";
        
        try {
            require_once 'config.php';
            $pdo = getDbConnection();
            echo "<div class='success'>✅ เชื่อมต่อฐานข้อมูลสำเร็จ</div>";
            
            // ตรวจสอบตาราง
            $tables = ['Children', 'Behaviors', 'Rewards', 'DailyActivity'];
            foreach ($tables as $table) {
                try {
                    $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
                    $count = $stmt->fetch()['count'];
                    echo "<div class='success'>✅ ตาราง $table: $count records</div>";
                } catch (Exception $e) {
                    echo "<div class='error'>❌ ตาราง $table: {$e->getMessage()}</div>";
                }
            }
            
        } catch (Exception $e) {
            echo "<div class='error'>❌ ไม่สามารถเชื่อมต่อฐานข้อมูล: {$e->getMessage()}</div>";
        }

        // Test 3: API Endpoints
        echo "<h2>3️⃣ ทดสอบ API Endpoints</h2>";

        function testEndpoint($url, $name) {
            $start = microtime(true);
            
            $context = stream_context_create([
                'http' => [
                    'timeout' => 10,
                    'method' => 'GET'
                ]
            ]);
            
            try {
                $response = @file_get_contents($url, false, $context);
                $time = round((microtime(true) - $start) * 1000, 2);
                
                if ($response === false) {
                    echo "<div class='error'>❌ $name: ไม่สามารถเข้าถึงได้</div>";
                    return false;
                }
                
                $data = json_decode($response, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    echo "<div class='error'>❌ $name: JSON ไม่ถูกต้อง</div>";
                    return false;
                }
                
                if (isset($data['error'])) {
                    echo "<div class='error'>❌ $name: {$data['error']} ({$time}ms)</div>";
                    return false;
                }
                
                echo "<div class='success'>✅ $name: สำเร็จ ({$time}ms)</div>";
                return true;
                
            } catch (Exception $e) {
                echo "<div class='error'>❌ $name: {$e->getMessage()}</div>";
                return false;
            }
        }

        $endpoints = [
            'health' => 'Health Check',
            'children' => 'Children API',
            'behaviors' => 'Behaviors API', 
            'rewards' => 'Rewards API',
            'dashboard' => 'Dashboard API'
        ];

        $passed = 0;
        $total = count($endpoints);

        foreach ($endpoints as $endpoint => $name) {
            if (testEndpoint("$api_base?$endpoint", $name)) {
                $passed++;
            }
        }

        echo "<h2>4️⃣ สรุปผลการทดสอบ</h2>";

        $success_rate = round(($passed / $total) * 100, 2);

        if ($success_rate >= 90) {
            echo "<div class='success'>";
            echo "<h3>🎉 ยอดเยี่ยม! ระบบพร้อมใช้งาน</h3>";
            echo "<p>ผ่านการทดสอบ $passed/$total ($success_rate%)</p>";
            echo "</div>";
        } elseif ($success_rate >= 60) {
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

        <h2>5️⃣ ขั้นตอนต่อไป</h2>

        <?php if ($success_rate >= 90): ?>
            <div class="success">
                <h4>🚀 ระบบพร้อมใช้งาน!</h4>
                <p>คุณสามารถ:</p>
                <ul>
                    <li>ใช้หน้าทดสอบ: <a href="index.php" class="btn">เปิด Test Interface</a></li>
                    <li>ทำการทดสอบขั้นสูง: <a href="test.php" class="btn">Advanced Testing</a></li>
                    <li>ดูเครื่องมือบำรุงรักษา: <a href="maintenance.php" class="btn">Maintenance Tools</a></li>
                </ul>
            </div>
        <?php else: ?>
            <div class="warning">
                <h4>🔧 การแก้ไขปัญหา</h4>
                <ul>
                    <li><strong>Database Error:</strong> ตรวจสอบ config.php และรหัสผ่าน</li>
                    <li><strong>API Error:</strong> ตรวจสอบไฟล์ api.php และ .htaccess</li>
                    <li><strong>Permission Error:</strong> ตรวจสอบสิทธิ์ไฟล์และโฟลเดอร์</li>
                </ul>
            </div>
        <?php endif; ?>

        <h2>6️⃣ ตัวอย่าง API Calls</h2>
        
        <h4>JavaScript:</h4>
        <div class="code">// ดึงข้อมูลเด็กทั้งหมด
fetch('<?php echo $api_base; ?>?children')
  .then(response => response.json())
  .then(data => console.log(data));

// บันทึกกิจกรรม
fetch('<?php echo $api_base; ?>?activities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ChildId: 'C001',
    ItemId: 'B001',
    ActivityType: 'Good',
    Count: 1
  })
}).then(r => r.json()).then(console.log);</div>

        <h4>cURL:</h4>
        <div class="code"># Health Check
curl "<?php echo $api_base; ?>?health"

# Get Children
curl "<?php echo $api_base; ?>?children"

# Record Activity
curl -X POST "<?php echo $api_base; ?>?activities" \
  -H "Content-Type: application/json" \
  -d '{"ChildId":"C001","ItemId":"B001","ActivityType":"Good","Count":1}'</div>

        <h2>7️⃣ ข้อมูลระบบ</h2>
        <div class="info">
            <strong>🕒 เวลาปัจจุบัน:</strong> <?php echo date('Y-m-d H:i:s'); ?><br>
            <strong>🌐 Server:</strong> <?php echo $_SERVER['HTTP_HOST']; ?><br>
            <strong>🐘 PHP Version:</strong> <?php echo PHP_VERSION; ?><br>
            <strong>📁 Document Root:</strong> <?php echo $_SERVER['DOCUMENT_ROOT']; ?><br>
            <strong>📂 Current Directory:</strong> <?php echo __DIR__; ?>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="index.php" class="btn">🧪 Test Interface</a>
            <a href="<?php echo $api_base; ?>?health" class="btn" target="_blank">🏥 Health Check</a>
            <a href="<?php echo $api_base; ?>?dashboard" class="btn" target="_blank">📊 Dashboard</a>
        </div>
    </div>
</body>
</html>