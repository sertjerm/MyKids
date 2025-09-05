-- My-Kids Database Schema (MySQL)
-- สร้างฐานข้อมูลติดตามพฤติกรรมเด็ก

CREATE DATABASE IF NOT EXISTS mykids_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mykids_db;

-- ตาราง Children (เด็ก)
CREATE TABLE children (
    id VARCHAR(50) PRIMARY KEY,
    auto_id INT AUTO_INCREMENT UNIQUE,
    name VARCHAR(100) NOT NULL,
    age INT,
    avatar_path VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_children_auto_id (auto_id)
);

-- ตาราง Behaviors (พฤติกรรม)
CREATE TABLE behaviors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    points INT NOT NULL,
    color VARCHAR(20) NOT NULL,
    category VARCHAR(50),
    type ENUM('Good', 'Bad') NOT NULL,
    is_repeatable BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT chk_behaviors_type CHECK (type IN ('Good', 'Bad'))
);

-- ตาราง Rewards (รางวัล)
CREATE TABLE rewards (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    cost INT NOT NULL,
    color VARCHAR(20) NOT NULL,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT chk_rewards_cost CHECK (cost > 0)
);

-- ตาราง DailyActivity (กิจกรรมประจำวัน)
CREATE TABLE daily_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    behavior_id VARCHAR(50) NOT NULL,
    child_id VARCHAR(50) NOT NULL,
    activity_date DATE NOT NULL,
    activity_type VARCHAR(50) DEFAULT 'Good',
    count INT DEFAULT 1,
    earned_points INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (behavior_id) REFERENCES behaviors(id),
    FOREIGN KEY (child_id) REFERENCES children(id),
    INDEX idx_daily_activity_date (activity_date),
    INDEX idx_daily_activity_child (child_id),
    INDEX idx_daily_activity_behavior (behavior_id)
);

-- View สำหรับสรุปพฤติกรรมประจำวัน
CREATE VIEW vw_behavior_daily_summary AS
SELECT 
    b.id,
    b.name,
    b.points,
    b.color,
    b.category,
    d.child_id,
    d.activity_date,
    b.type,
    COUNT(DISTINCT d.child_id) AS completed_children_count,
    SUM(IFNULL(d.count, 0)) AS total_count,
    SUM(IFNULL(d.count, 0)) * b.points AS total_points,
    CASE WHEN COUNT(d.child_id) > 0 THEN 1 ELSE 0 END AS is_completed
FROM behaviors b
LEFT JOIN daily_activity d ON b.id = d.behavior_id
WHERE b.is_active = 1
GROUP BY b.id, b.name, b.points, b.color, b.category, b.type, d.child_id, d.activity_date;

-- ข้อมูลตัวอย่าง
-- เด็ก
INSERT INTO children (id, name, age) VALUES 
('child_001', 'น้องพีฟ่า', 11),
('child_002', 'น้องพีฟอง', 10);

-- พฤติกรรมดี
INSERT INTO behaviors (id, name, points, color, category, type, is_repeatable) VALUES 
('bhv_001', 'แปรฟัน', 3, '#4ADE80', 'สุขภาพ', 'Good', true),
('bhv_002', 'เก็บของเล่น', 2, '#60A5FA', 'ความรับผิดชอบ', 'Good', true),
('bhv_003', 'อ่านหนังสือ', 5, '#A78BFA', 'การเรียนรู้', 'Good', true),
('bhv_004', 'ช่วยงานบ้าน', 4, '#FBBF24', 'ความรับผิดชอบ', 'Good', true),
('bhv_005', 'หาดหวาน', 8, '#FB7185', 'มารยาท', 'Good', true),
('bhv_006', 'ดื่มน้ำ', 3, '#34D399', 'สุขภาพ', 'Good', true),
('bhv_007', 'ช่วยพี่/น้อง', 6, '#F472B6', 'ความเมตตา', 'Good', true);

-- พฤติกรรมไม่ดี
INSERT INTO behaviors (id, name, points, color, category, type, is_repeatable) VALUES 
('bhv_bad_001', 'ขุดคาย', -3, '#EF4444', 'มารยาท', 'Bad', true),
('bhv_bad_002', 'โกหก', -5, '#DC2626', 'จริยธรรม', 'Bad', true),
('bhv_bad_003', 'ขี้เล่น', -2, '#F87171', 'พฤติกรรม', 'Bad', true),
('bhv_bad_004', 'เล่นมือถือนาน', -4, '#FCA5A5', 'สุขภาพ', 'Bad', true),
('bhv_bad_005', 'หิวร้าวเพื่อน', -8, '#B91C1C', 'จริยธรรม', 'Bad', true),
('bhv_bad_006', 'ไม่ใส่ขรุ่ย', -6, '#DC2626', 'มารยาท', 'Bad', true);

-- รางวัล
INSERT INTO rewards (id, name, cost, color, category) VALUES 
('rwd_001', 'ไอศกรีม', 10, '#FFE4E1', 'ขนม'),
('rwd_002', 'ดู YouTube 30 นาที', 15, '#E6E6FA', 'บันเทิง'),
('rwd_003', 'ซื้อสติ๊กเกอร์', 20, '#F0F8FF', 'ของเล่น'),
('rwd_004', 'สะตึงร้า', 25, '#FFF8DC', 'ขนม'),
('rwd_005', 'พ่อแบบปูพื่น', 50, '#FFEFD5', 'กิจกรรม'),
('rwd_006', 'ไปเที่ยวบ้านพื่อเป็', 80, '#F5FFFA', 'ท่องเที่ยว'),
('rwd_007', 'ลุง 100 บาท', 100, '#FFF5EE', 'เงิน'),
('rwd_008', 'เอิ่นบ้านใพ', 60, '#F0FFFF', 'กิจกรรม'),
('rwd_009', 'ไปพานิจ', 120, '#F5F5DC', 'ท่องเที่ยว'),
('rwd_010', 'บัดปีมิส', 150, '#FFB6C1', 'ของเล่น');
