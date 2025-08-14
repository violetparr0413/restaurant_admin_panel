export interface User {
    user_id: number;
    username: string;
    password: string;
    user_role: string;
    created_at: string;
}

export interface Employee {
    employee_id: number;
    name: string;
    password: string;
    role: string;
    table_order: number;
    is_logged_in: boolean;
    created_at: string;
}

export interface Category {
    category_id: number;
    category_name: string;
    category_en_name: string;
    category_zh_name: string;
    category_ko_name: string;
    parent_id: number;
    parent?: Category;
    category_image: string;
    category_order: number;
    created_at: string;
    childs?: Category[];
}

export interface Dish {
    dish_id: number;
    category_id: number;
    category: Category;
    dish_name: string;
    dish_en_name: string;
    dish_zh_name: string;
    dish_ko_name: string;
    dish_image: string;
    dish_description: string;
    dish_en_description: string;
    dish_zh_description: string;
    dish_ko_description: string;
    dish_unit: string;
    dish_en_unit: string;
    dish_zh_unit: string;
    dish_ko_unit: string;
    dish_price: number;
    dish_status: number;
    tax_price: number;
    dish_available: number;
    created_at: string;
}

export interface Service {
    service_id: number;
    service_name: string;
    service_en_name: string;
    service_zh_name: string;
    service_ko_name: string;
    created_at: string;
}

export interface Order {
    order_id: number;
    dish_id: number;
    dish: Dish;
    table_number: number;
    employee: Employee;
    order_qty: number;
    order_status: string;
    created_at: string;
}

export interface Brand {
    brand_id: number;
    restaurant_logo: string;
    restaurant_name: string;
    restaurant_background: string;
    dish1: string;
    dish2: string;
    dish3: string;
    dish4: string;
    dish5: string;
    dish1_en: string;
    dish2_en: string;
    dish3_en: string;
    dish4_en: string;
    dish5_en: string;
    dish1_zh: string;
    dish2_zh: string;
    dish3_zh: string;
    dish4_zh: string;
    dish5_zh: string;
    dish1_ko: string;
    dish2_ko: string;
    dish3_ko: string;
    dish4_ko: string;
    dish5_ko: string;
    background_duration: number;
    screen_saver_after: number;
}

export interface ServiceHistory {
    service_history_id: number;
    service_id: number;
    service: Service;
    amount: number;
    table_number: number;
    table: Employee;
    manager_id: number;
    manager: Employee;
    status: string;
    created_at: string;
}

export interface Printer {
    printer_id: number;
    ip_address: string;
    port: string;
    position: string;
    created_at: string;
}

export interface PaymentMethod {
    payment_method_id: number;
    payment_method_name: string;
    created_at: string;
}

export interface GroupOrder {
    dish_id: number;
    total_qty: number;
    total_value: number;
    dish: Dish;
}

export interface PaymentOrder {
    payment_method_id: number;
    payment_method_name: string;
    total_value: number;
}

export interface Statistics {
    groupedOrders?: GroupOrder[];
    paidTotal: number;
    paymentOrders?: PaymentOrder[];
    unpaidTotal: number;
}