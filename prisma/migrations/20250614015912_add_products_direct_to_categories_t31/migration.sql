-- CreateTable
CREATE TABLE `allergens` (
    `allergen_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `icon` VARCHAR(255) NULL,
    `order` INTEGER NULL,

    PRIMARY KEY (`allergen_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `allergens_product` (
    `allergen_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,

    PRIMARY KEY (`allergen_id`, `product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `allies` (
    `ally_id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NULL,
    `name` VARCHAR(50) NULL,
    `type` VARCHAR(3) NULL,
    `show_all_restaurants` VARCHAR(1) NULL,
    `show_all_hotels` VARCHAR(1) NULL,
    `show_all_excursions` VARCHAR(1) NULL,
    `status` VARCHAR(1) NULL,
    `registered_at` DATETIME(0) NULL,

    PRIMARY KEY (`ally_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_keys` (
    `api_key_id` INTEGER NOT NULL AUTO_INCREMENT,
    `api_key` VARCHAR(40) NULL,
    `level` INTEGER NOT NULL,
    `ignore_limits` BOOLEAN NOT NULL DEFAULT false,
    `is_private_key` BOOLEAN NOT NULL DEFAULT false,
    `ip_addresses` TEXT NULL,
    `date_created` INTEGER NOT NULL,
    `company_id` INTEGER NULL,

    PRIMARY KEY (`api_key_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_type` (
    `business_type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(50) NULL,

    PRIMARY KEY (`business_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NULL,
    `image` VARCHAR(45) NULL,
    `status` BOOLEAN NULL DEFAULT true,
    `display_order` INTEGER NULL,
    `client_id` INTEGER NULL,
    `registered_at` DATETIME(0) NULL,
    `deleted` TINYINT NULL DEFAULT 0,
    `deleted_at` VARCHAR(20) NULL,
    `deleted_by` VARCHAR(50) NULL,
    `deleted_ip` VARCHAR(20) NULL,

    INDEX `fk_category_client`(`client_id`),
    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `client_languages` (
    `client_id` INTEGER NOT NULL,
    `language_id` VARCHAR(2) NOT NULL,

    INDEX `fk_idiomas_clientes_idioma`(`language_id`),
    PRIMARY KEY (`client_id`, `language_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clients` (
    `client_id` INTEGER NOT NULL,
    `country_code` VARCHAR(10) NULL,
    `tax_id` VARCHAR(20) NULL,
    `name` VARCHAR(100) NULL,
    `address` VARCHAR(255) NULL,
    `instagram_account` VARCHAR(100) NULL,
    `whatsapp_account` VARCHAR(12) NULL,
    `company_logo` VARCHAR(70) NULL,
    `link_style` VARCHAR(40) NULL,
    `main_logo` VARCHAR(100) NULL,
    `app_name` VARCHAR(50) NULL,
    `email` VARCHAR(200) NOT NULL,
    `confirmed` BOOLEAN NULL,
    `activation_code` VARCHAR(200) NULL,
    `photo1` VARCHAR(200) NULL,
    `photo2` VARCHAR(200) NULL,
    `signup_date` DATE NULL,
    `activation_date` DATE NULL,
    `qr_photo` VARCHAR(50) NULL,
    `currency_id` INTEGER NULL,
    `type_id` INTEGER NULL,
    `country_id` INTEGER NULL,
    `allergens` BOOLEAN NULL,
    `city` VARCHAR(50) NULL,
    `postal_code` VARCHAR(15) NULL,
    `website` VARCHAR(200) NULL,
    `social_description` VARCHAR(200) NULL,
    `whatsapp_number` VARCHAR(15) NULL,
    `whatsapp_message` VARCHAR(500) NULL,
    `enable_whatsapp` BOOLEAN NULL,
    `menu_background` VARCHAR(100) NULL,
    `background_color` VARCHAR(6) NULL,
    `footer_text` VARCHAR(1000) NULL,
    `show_purchase_link` BOOLEAN NULL,
    `purchase_clicks` INTEGER NULL,
    `purchase_button_text` VARCHAR(20) NULL,
    `primary_button_bg_color` VARCHAR(7) NULL,
    `primary_button_text_color` VARCHAR(7) NULL,
    `monday_schedule_start` VARCHAR(5) NULL,
    `monday_schedule_end` VARCHAR(5) NULL,
    `tuesday_schedule_start` VARCHAR(5) NULL,
    `tuesday_schedule_end` VARCHAR(5) NULL,
    `wednesday_schedule_start` VARCHAR(5) NULL,
    `wednesday_schedule_end` VARCHAR(5) NULL,
    `thursday_schedule_start` VARCHAR(5) NULL,
    `thursday_schedule_end` VARCHAR(5) NULL,
    `friday_schedule_start` VARCHAR(5) NULL,
    `friday_schedule_end` VARCHAR(5) NULL,
    `saturday_schedule_start` VARCHAR(5) NULL,
    `saturday_schedule_end` VARCHAR(5) NULL,
    `sunday_schedule_start` VARCHAR(5) NULL,
    `sunday_schedule_end` VARCHAR(5) NULL,
    `show_schedule` BOOLEAN NULL,
    `enable_stripe` BOOLEAN NULL,
    `stripe_mode` BOOLEAN NULL,
    `card_only_purchases` BOOLEAN NULL,
    `enable_intro` BOOLEAN NULL,
    `intro_video` VARCHAR(100) NULL,
    `remove_intro_button` VARCHAR(50) NULL,
    `remove_intro_position` VARCHAR(10) NULL,
    `remove_intro_margin` VARCHAR(3) NULL,
    `intro_logo` VARCHAR(50) NULL,
    `intro_logo_position` VARCHAR(10) NULL,
    `intro_logo_margin` VARCHAR(3) NULL,
    `footer_text_color` VARCHAR(6) NULL,
    `stripe_id` VARCHAR(50) NULL,
    `stripe_commission_percent` DECIMAL(5, 2) NULL,
    `stripe_commission_amount` DECIMAL(10, 2) NULL,
    `expiration_date` DATE NULL,
    `allows_reservation` BOOLEAN NULL,
    `delivery_service` BOOLEAN NULL,
    `delivery_status` BOOLEAN NULL,
    `facebook` VARCHAR(150) NULL,
    `twitter` VARCHAR(150) NULL,
    `instagram` VARCHAR(150) NULL,
    `web_email` VARCHAR(70) NULL,
    `phone` VARCHAR(20) NULL,
    `menu_type` ENUM('digital', 'pdf') NULL,

    PRIMARY KEY (`client_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `countries` (
    `country_id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(50) NULL,

    PRIMARY KEY (`country_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `currencies` (
    `currency_id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(50) NULL,
    `symbol` VARCHAR(3) NULL,
    `stripe_code` VARCHAR(5) NULL,

    PRIMARY KEY (`currency_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `establishment_areas` (
    `area_id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NULL,
    `name` VARCHAR(50) NULL,
    `description` VARCHAR(500) NULL,
    `status` BOOLEAN NULL,

    PRIMARY KEY (`area_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `languages` (
    `id` VARCHAR(2) NOT NULL,
    `description` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `magazine` (
    `magazine_id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NULL,
    `publication_date` DATE NULL,
    `status` BOOLEAN NULL,
    `title` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `registered_at` DATETIME(0) NULL,
    `file` VARCHAR(100) NULL,
    `hash_code` VARCHAR(50) NULL,
    `tracking_code` TEXT NULL,

    INDEX `fk_magazine_client`(`client_id`),
    PRIMARY KEY (`magazine_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marketplace` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_type` INTEGER NULL,
    `image` VARCHAR(100) NULL,
    `video` VARCHAR(100) NULL,
    `quantity` INTEGER NULL,
    `status` BOOLEAN NULL,
    `name` VARCHAR(50) NULL,
    `description` TEXT NULL,
    `sku` VARCHAR(50) NULL,
    `deleted` BOOLEAN NULL,
    `deleted_at` VARCHAR(20) NULL,
    `deleted_by` VARCHAR(20) NULL,
    `deleted_ip` VARCHAR(20) NULL,
    `display_order` INTEGER NULL,
    `registered_at` VARCHAR(20) NULL,
    `price` DECIMAL(12, 2) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu` (
    `menu_id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`menu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_history` (
    `history_id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(30) NULL,
    `last_name` VARCHAR(30) NULL,
    `url` VARCHAR(300) NULL,
    `accepted` BOOLEAN NULL,
    `created_at` DATETIME(0) NOT NULL,
    `update_at` DATETIME(0) NOT NULL,
    `delete_at` DATETIME(0) NOT NULL,
    `menu_id` INTEGER NOT NULL,
    `client_id` INTEGER NULL,

    UNIQUE INDEX `id`(`history_id`),
    INDEX `fk_historial_cliente`(`client_id`),
    INDEX `fk_menu_history_menu`(`menu_id`),
    PRIMARY KEY (`history_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_translations` (
    `translation_id` INTEGER NOT NULL AUTO_INCREMENT,
    `menu_id` INTEGER NULL,
    `language` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,

    UNIQUE INDEX `TraduccionMenu_menuId_idioma_key`(`menu_id`, `language`),
    PRIMARY KEY (`translation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `data` VARCHAR(191) NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `product_id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NULL,
    `section_id` INTEGER NULL,
    `category_id` INTEGER NULL,
    `name` VARCHAR(100) NOT NULL,
    `display_order` INTEGER NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `status` BOOLEAN NULL DEFAULT true,
    `description` TEXT NULL,
    `image` VARCHAR(100) NULL,
    `registered_at` DATETIME(0) NULL,
    `sku` VARCHAR(100) NULL,
    `multiple_prices` VARCHAR(1) NULL,
    `price1` DECIMAL(14, 2) NULL,
    `price2` DECIMAL(14, 2) NULL,
    `price3` DECIMAL(14, 2) NULL,
    `price4` DECIMAL(14, 2) NULL,
    `label_price1` VARCHAR(50) NULL,
    `label_price2` VARCHAR(50) NULL,
    `label_price3` VARCHAR(50) NULL,
    `label_price4` VARCHAR(50) NULL,
    `departure_point` VARCHAR(1000) NULL,
    `requirements` VARCHAR(1000) NULL,
    `commission_price1` DECIMAL(14, 2) NULL,
    `commission_price2` DECIMAL(14, 2) NULL,
    `commission_price3` DECIMAL(14, 2) NULL,
    `commission_price4` DECIMAL(14, 2) NULL,
    `allow_reservation_commission` VARCHAR(1) NULL,
    `duration_hours` VARCHAR(2) NULL,
    `duration_minutes` VARCHAR(2) NULL,
    `free_pickup_hotel` VARCHAR(1) NULL,
    `zone` VARCHAR(100) NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` VARCHAR(20) NULL,
    `deleted_by` VARCHAR(50) NULL,
    `deleted_ip` VARCHAR(20) NULL,
    `video` VARCHAR(100) NULL,
    `no_picture` INTEGER NULL DEFAULT 0,
    `categoriesCategory_id` INTEGER NULL,

    INDEX `fk_product_client`(`client_id`),
    INDEX `fk_products_section`(`section_id`),
    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products_sections` (
    `product_id` INTEGER NOT NULL,
    `section_id` INTEGER NOT NULL,

    INDEX `fk_product_section`(`section_id`),
    PRIMARY KEY (`product_id`, `section_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_statistics` (
    `statistic_id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NULL,
    `date` DATETIME(0) NULL,
    `total_amount` DECIMAL(14, 2) NULL,
    `cart` TEXT NULL,
    `ip_address` VARCHAR(50) NULL,
    `stripe_payment_response_id` VARCHAR(100) NULL,
    `stripe_payment_status` VARCHAR(25) NULL,
    `stripe_payment_json` TEXT NULL,

    PRIMARY KEY (`statistic_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservation_control` (
    `control_id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NULL,
    `request_date` DATETIME(0) NULL,
    `reservation_date` DATE NULL,
    `reservation_time` VARCHAR(5) NULL,
    `guest_count` INTEGER NULL,
    `name` VARCHAR(60) NULL,
    `phone` VARCHAR(15) NULL,
    `email` VARCHAR(200) NULL,
    `notes` TEXT NULL,
    `id_area` INTEGER NULL,
    `status` BOOLEAN NULL,
    `confirmation_date` DATETIME(0) NULL,
    `confirmed_by` VARCHAR(100) NULL,
    `rejection_date` DATETIME(0) NULL,
    `rejected_by` VARCHAR(100) NULL,
    `ip_address` VARCHAR(20) NULL,

    PRIMARY KEY (`control_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservation_details` (
    `detail_id` INTEGER NOT NULL,
    `row_id` INTEGER NOT NULL,
    `product_id` INTEGER NULL,
    `quantity` INTEGER NULL,
    `unit_price` DECIMAL(14, 2) NULL,
    `sku` VARCHAR(45) NULL,
    `name` VARCHAR(300) NULL,
    `options` VARCHAR(500) NULL,
    `booking_id` INTEGER NULL,

    INDEX `fk_reservation_details_booking`(`booking_id`),
    INDEX `fk_reservation_details_product`(`product_id`),
    PRIMARY KEY (`detail_id`, `row_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservations` (
    `reservation_id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NULL,
    `name` VARCHAR(50) NULL,
    `phone` VARCHAR(15) NULL,
    `address` VARCHAR(500) NULL,
    `is_delivery` BOOLEAN NULL,
    `delivery_cost` DECIMAL(14, 2) NULL,
    `booking_amount` DECIMAL(14, 2) NULL,
    `status` BOOLEAN NULL,
    `request_date` VARCHAR(20) NULL,
    `approval_date` VARCHAR(20) NULL,
    `currency_id` INTEGER NULL,
    `delivery_zone_id` INTEGER NULL,
    `ip` VARCHAR(15) NOT NULL,
    `delivery_zone_desc` VARCHAR(100) NULL,
    `rejection_date` VARCHAR(20) NULL,
    `rejected_by` VARCHAR(30) NULL,
    `read_date` VARCHAR(20) NULL,
    `read_by` VARCHAR(30) NULL,
    `approved_by` VARCHAR(30) NULL,
    `dispatch_date` VARCHAR(20) NULL,
    `dispatched_by` VARCHAR(30) NULL,
    `shipment_date` VARCHAR(20) NULL,
    `shipped_by` VARCHAR(30) NULL,
    `hash` VARCHAR(50) NULL,
    `service_rating` VARCHAR(1) NULL,
    `rating_comment` TEXT NULL,
    `client_confirmation_date` VARCHAR(20) NULL,
    `publish_rating` VARCHAR(1) NULL,
    `rating_status_date` VARCHAR(20) NULL,
    `rating_published_by` VARCHAR(30) NULL,
    `email` VARCHAR(100) NULL,
    `stripe_payment_response_id` VARCHAR(100) NULL,
    `stripe_payment_status` VARCHAR(50) NULL,
    `stripe_payment_json_response` TEXT NULL,
    `stripe_refund_response_id` VARCHAR(100) NULL,
    `stripe_refund_status` VARCHAR(50) NULL,
    `stripe_refund_json_response` TEXT NULL,

    INDEX `fk_reservation_client`(`client_id`),
    PRIMARY KEY (`reservation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,

    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sections` (
    `section_id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NULL,
    `name` VARCHAR(50) NULL,
    `status` BOOLEAN NULL DEFAULT true,
    `display_order` INTEGER NULL,
    `image` VARCHAR(100) NULL,
    `registered_at` DATETIME(0) NULL,
    `category_id` INTEGER NULL,
    `deleted` TINYINT NULL DEFAULT 0,
    `deleted_at` VARCHAR(20) NULL,
    `deleted_by` VARCHAR(50) NULL,
    `deleted_ip` VARCHAR(20) NULL,

    INDEX `fk_section_category`(`category_id`),
    PRIMARY KEY (`section_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipping_zones` (
    `shipping_zone_id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NULL,
    `name` VARCHAR(100) NULL,
    `status` BOOLEAN NULL,
    `is_free` BOOLEAN NULL,
    `cost` DECIMAL(14, 2) NULL,
    `registered_at` DATETIME(0) NULL,

    PRIMARY KEY (`shipping_zone_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `store_product_type` (
    `product_type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NULL,
    `status` BOOLEAN NULL,

    PRIMARY KEY (`product_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `translations` (
    `translation_id` INTEGER NOT NULL AUTO_INCREMENT,
    `language_id` VARCHAR(2) NULL,
    `table_name` VARCHAR(50) NULL,
    `column_name` VARCHAR(50) NULL,
    `element_id` INTEGER NULL,
    `text_value` TEXT NULL,

    PRIMARY KEY (`translation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` VARCHAR(30) NOT NULL,
    `password` VARCHAR(30) NULL,
    `username` VARCHAR(200) NULL,
    `profile` VARCHAR(2) NULL,
    `email` VARCHAR(255) NOT NULL,
    `nationality` VARCHAR(1) NULL,
    `identification` VARCHAR(11) NULL,
    `address` VARCHAR(1000) NULL,
    `phone` VARCHAR(200) NULL,
    `client_id` INTEGER NULL,
    `is_seller` BOOLEAN NULL,
    `has_commission` BOOLEAN NULL,
    `status` BOOLEAN NULL,
    `user_type` VARCHAR(2) NULL,
    `job_title` VARCHAR(50) NULL,
    `biography` TEXT NULL,
    `avatar` VARCHAR(100) NULL,
    `whatsapp` VARCHAR(45) NULL,
    `first_name` VARCHAR(45) NULL,
    `position` VARCHAR(45) NULL,
    `skills` VARCHAR(500) NULL,
    `website` VARCHAR(200) NULL,
    `maps_link` VARCHAR(200) NULL,
    `confirmed` BOOLEAN NULL,
    `manifest` VARCHAR(50) NULL,
    `role_id` INTEGER NULL,

    INDEX `fk_usuarios_roles`(`role_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zones` (
    `zone_id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NULL,
    `zone` VARCHAR(50) NULL,
    `free_pickup` BOOLEAN NULL,
    `status` BOOLEAN NULL,
    `registered_at` DATETIME(0) NULL,

    PRIMARY KEY (`zone_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `fk_category_client` FOREIGN KEY (`client_id`) REFERENCES `clients`(`client_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `client_languages` ADD CONSTRAINT `fk_client_languages` FOREIGN KEY (`client_id`) REFERENCES `clients`(`client_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `magazine` ADD CONSTRAINT `fk_magazine_client` FOREIGN KEY (`client_id`) REFERENCES `clients`(`client_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `menu_history` ADD CONSTRAINT `fk_menu_history_menu` FOREIGN KEY (`menu_id`) REFERENCES `menu`(`menu_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `menu_translations` ADD CONSTRAINT `TraduccionMenu_menuId_fkey` FOREIGN KEY (`menu_id`) REFERENCES `menu`(`menu_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_product_client` FOREIGN KEY (`client_id`) REFERENCES `clients`(`client_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_products_section` FOREIGN KEY (`section_id`) REFERENCES `sections`(`section_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_categoriesCategory_id_fkey` FOREIGN KEY (`categoriesCategory_id`) REFERENCES `categories`(`category_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products_sections` ADD CONSTRAINT `fk_product_section` FOREIGN KEY (`section_id`) REFERENCES `sections`(`section_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products_sections` ADD CONSTRAINT `fk_section_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservation_details` ADD CONSTRAINT `fk_reservation_details_booking` FOREIGN KEY (`booking_id`) REFERENCES `reservations`(`reservation_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `fk_reservation_client` FOREIGN KEY (`client_id`) REFERENCES `clients`(`client_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sections` ADD CONSTRAINT `fk_section_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
