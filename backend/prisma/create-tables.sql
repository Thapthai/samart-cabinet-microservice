-- Generated from schema.prisma - PostgreSQL
-- Run this script to create all tables

-- app_microservice_users
CREATE TABLE "app_microservice_users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "department_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_secret" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_microservice_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "app_microservice_users_email_key" ON "app_microservice_users"("email");

-- app_microservice_cabinets
CREATE TABLE "app_microservice_cabinets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "stock_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_microservice_cabinets_pkey" PRIMARY KEY ("id")
);

-- app_microservice_cabinets_stock (CabinetDepartments)
CREATE TABLE "app_microservice_cabinets_stock" (
    "id" SERIAL NOT NULL,
    "cabinet_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_microservice_cabinets_stock_pkey" PRIMARY KEY ("id")
);

-- app_microservice_cabinets_items
CREATE TABLE "app_microservice_cabinets_items" (
    "id" SERIAL NOT NULL,
    "cabinet_id" INTEGER NOT NULL,
    "item_code" TEXT NOT NULL,
    "stock_min" INTEGER NOT NULL,
    "stock_max" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_microservice_cabinets_items_pkey" PRIMARY KEY ("id")
);

-- app_microservice_client_credentials
CREATE TABLE "app_microservice_client_credentials" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_secret_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "last_used_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_microservice_client_credentials_pkey" PRIMARY KEY ("id")
);

-- app_microservice_medical_supply_usages (SupplyUsages)
CREATE TABLE "app_microservice_medical_supply_usages" (
    "id" SERIAL NOT NULL,
    "hospital" TEXT NOT NULL,
    "en" TEXT NOT NULL,
    "patient_hn" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "patient_name_th" TEXT NOT NULL,
    "patient_name_en" TEXT NOT NULL,
    "usage_datetime" TIMESTAMP(3) NOT NULL,
    "usage_type" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "department_code" TEXT NOT NULL,
    "recorded_by_user_id" TEXT NOT NULL,
    "print_location" TEXT NOT NULL,
    "print_date" TIMESTAMP(3) NOT NULL,
    "time_print_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_microservice_medical_supply_usages_pkey" PRIMARY KEY ("id")
);

-- app_microservice_supply_usages_logs
CREATE TABLE "app_microservice_supply_usages_logs" (
    "id" SERIAL NOT NULL,
    "usage_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_microservice_supply_usages_logs_pkey" PRIMARY KEY ("id")
);

-- app_microservice_staff_role_permissions
CREATE TABLE "app_microservice_staff_role_permissions" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "menu_href" TEXT NOT NULL,
    "can_access" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_microservice_staff_role_permissions_pkey" PRIMARY KEY ("id")
);

-- app_microservice_staff_roles
CREATE TABLE "app_microservice_staff_roles" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_microservice_staff_roles_pkey" PRIMARY KEY ("id")
);

-- app_microservice_staff_users
CREATE TABLE "app_microservice_staff_users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "fname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "department_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_secret" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_microservice_staff_users_pkey" PRIMARY KEY ("id")
);

-- SupplyItemReturnRecords (no @@map in schema - use default table name)
CREATE TABLE "SupplyItemReturnRecords" (
    "id" SERIAL NOT NULL,
    "item_code" TEXT NOT NULL,
    "stock_id" INTEGER NOT NULL,
    "qty_returned" INTEGER NOT NULL,
    "return_reason" TEXT NOT NULL,
    "return_datetime" TIMESTAMP(3) NOT NULL,
    "return_by_user_id" TEXT NOT NULL,
    "return_note" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplyItemReturnRecords_pkey" PRIMARY KEY ("id")
);

-- SupplyUsageItems (no @@map in schema)
CREATE TABLE "SupplyUsageItems" (
    "id" SERIAL NOT NULL,
    "medical_supply_usage_id" INTEGER NOT NULL,
    "order_item_code" TEXT NOT NULL,
    "order_item_description" TEXT NOT NULL,
    "assession_no" TEXT NOT NULL,
    "order_item_status" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "uom" TEXT NOT NULL,
    "supply_code" TEXT NOT NULL,
    "supply_name" TEXT NOT NULL,
    "supply_category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "qty_used_with_patient" INTEGER NOT NULL,
    "qty_returned_to_cabinet" INTEGER NOT NULL,
    "item_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplyUsageItems_pkey" PRIMARY KEY ("id")
);
