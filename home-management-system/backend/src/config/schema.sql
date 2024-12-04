-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS home_management;
USE home_management;


-- Users table (basic authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,  -- 255 for hashed passwords
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    is_debtor BOOLEAN DEFAULT FALSE,
    net_amount FLoat
);

--  To store the Cleared Splits
CREATE TABLE IF NOT EXISTS cleared_splits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    debtor VARCHAR(255) NOT NULL,
    creditor VARCHAR(255) NOT NULL, 
    amount DECIMAL(10, 2) NOT NULL, 
    cleared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add sample users
INSERT INTO users (username, password) VALUES
('user1', 'password123'),
('user2', 'password123');

-- Notice board table
CREATE TABLE IF NOT EXISTS notices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    author_id INT NOT NULL,
    is_parcel BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_author (author_id),
    INDEX idx_created_at (created_at)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payer_id INT NOT NULL,
    date DATE NOT NULL,
    split_type ENUM('EQUAL', 'CUSTOM') DEFAULT 'EQUAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payer (payer_id),
    INDEX idx_date (date)
);

-- Expense splits table (for tracking who owes what)
CREATE TABLE IF NOT EXISTS expense_splits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expense_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('PENDING', 'PAID') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    INDEX idx_expense_user (expense_id, user_id)
);

-- Chores table
CREATE TABLE IF NOT EXISTS chores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    assigned_to INT,
    due_date DATE,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
);



-- Grocery items table
CREATE TABLE IF NOT EXISTS grocery_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    quantity INT DEFAULT 0,
    unit VARCHAR(20),
    status ENUM('IN_STOCK', 'LOW', 'OUT_OF_STOCK') DEFAULT 'IN_STOCK',
    last_purchased DATE,
    threshold_quantity INT DEFAULT 1,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_category (category)
);

-- Grocery purchase history
CREATE TABLE IF NOT EXISTS grocery_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    purchased_by INT NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES grocery_items(id) ON DELETE CASCADE,
    INDEX idx_item (item_id),
    INDEX idx_purchased_at (purchased_at)
);


DROP INDEX IF EXISTS ft_search ON notices;
ALTER TABLE notices ADD FULLTEXT INDEX ft_search (title, content);

-- Add some sample data
INSERT INTO notices (title, content, author_id, is_parcel) VALUES
('Welcome to Home Management', 'This is a test notice for all residents', 1, false),
('Package Arrived', 'Amazon package for Room 101 at reception', 1, true);

-- Chores table
CREATE TABLE IF NOT EXISTS chores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    assigned_to INT,
    due_date DATE,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
);

CREATE TABLE IF NOT EXISTS `schedule` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,          -- Unique identifier for the schedule
    `chore_id` INT NOT NULL,                      -- Foreign key to reference the chore
    `chore_name` VARCHAR(255) NOT NULL,           -- Name of the chore
    `assigned_to` VARCHAR(255) NOT NULL,          -- The person assigned to the chore
    `scheduled_date` DATE NOT NULL,               -- The date when the chore is scheduled
    `completed` BOOLEAN DEFAULT FALSE,            -- Whether the chore has been completed (default is false)
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of when the schedule was created
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Timestamp of the last update
    FOREIGN KEY (`chore_id`) REFERENCES `chores` (`id`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO grocery_items (name, quantity, unit, status, category) VALUES
('Milk', 2, 'gallons', 'IN_STOCK', 'Dairy'),
('Bread', 1, 'loaf', 'LOW', 'Bakery'),
('Eggs', 0, 'dozen', 'OUT_OF_STOCK', 'Dairy');

-- Create a trigger to update grocery item status based on quantity and threshold
DELIMITER //
CREATE TRIGGER update_grocery_status
BEFORE UPDATE ON grocery_items
FOR EACH ROW
BEGIN
    IF NEW.quantity <= 0 THEN
        SET NEW.status = 'OUT_OF_STOCK';
    ELSEIF NEW.quantity <= NEW.threshold_quantity THEN
        SET NEW.status = 'LOW';
    ELSE
        SET NEW.status = 'IN_STOCK';
    END IF;
END//
DELIMITER ;
