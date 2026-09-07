import mongoose from 'mongoose';
import { env } from '../config/env';
import { UserModel } from '../modules/users/user.model';
import { CategoryModel } from '../modules/categories/category.model';
import { ProductModel } from '../modules/products/product.model';
import { InventoryTransactionModel } from '../modules/inventory/transaction.model';
import { UserRole } from '../common/constants/roles';
import { InventoryTransactionType } from '../common/constants/stockStatus';

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seed] Connected. Clearing existing collections...');

    await Promise.all([
      UserModel.deleteMany({}),
      CategoryModel.deleteMany({}),
      ProductModel.deleteMany({}),
      InventoryTransactionModel.deleteMany({})
    ]);

    console.log('[Seed] Seeding Default Users...');
    // Create Admin and Staff Users
    const adminUser = await UserModel.create({
      name: 'System Admin',
      email: 'admin@inventory.com',
      password: 'Admin123!',
      role: UserRole.ADMIN
    });

    const staffUser = await UserModel.create({
      name: 'Operations Staff',
      email: 'staff@inventory.com',
      password: 'Staff123!',
      role: UserRole.USER
    });

    console.log('[Seed] Seeding Categories...');
    const categoryData = [
      {
        name: 'Electronics & Computers',
        description: 'Laptops, monitors, computing hardware, and smart devices',
        createdBy: adminUser._id
      },
      {
        name: 'Office Furniture & Supplies',
        description: 'Desks, ergonomic chairs, stationery, and filing units',
        createdBy: adminUser._id
      },
      {
        name: 'Warehouse & Logistics',
        description: 'Pallet jacks, storage crates, safety gear, and packing materials',
        createdBy: adminUser._id
      },
      {
        name: 'Audio & Entertainment',
        description: 'Headphones, microphones, studio gear, and speakers',
        createdBy: adminUser._id
      },
      {
        name: 'Networking & Servers',
        description: 'Routers, switches, patch cords, and server racks',
        createdBy: adminUser._id
      }
    ];

    const createdCategories = await CategoryModel.insertMany(categoryData);
    const catMap = new Map(createdCategories.map((c) => [c.name, c._id]));

    console.log('[Seed] Seeding Products & Stock Ledger...');
    const productsData = [
      // Electronics
      {
        name: 'Apple MacBook Pro 16" M3 Max',
        sku: 'MBP-16-M3M-01',
        category: catMap.get('Electronics & Computers'),
        description: '36GB RAM, 1TB SSD, Space Black enterprise workstation',
        quantity: 18,
        unitPrice: 2499.00,
        supplierName: 'Apple Enterprise Direct',
        lowStockThreshold: 10,
        barcode: 'MBP-16-M3M-01',
        createdBy: adminUser._id
      },
      {
        name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor',
        sku: 'MON-DELL-U2723QE',
        category: catMap.get('Electronics & Computers'),
        description: 'IPS Black technology with 98% DCI-P3 and 90W power delivery',
        quantity: 6, // LOW_STOCK
        unitPrice: 579.99,
        supplierName: 'Dell Commercial Solutions',
        lowStockThreshold: 10,
        barcode: 'MON-DELL-U2723QE',
        createdBy: adminUser._id
      },
      {
        name: 'Logitech MX Master 3S Wireless Mouse',
        sku: 'ACC-LOGI-MX3S-GR',
        category: catMap.get('Electronics & Computers'),
        description: 'Quiet clicks and 8K DPI tracking for any surface',
        quantity: 45, // IN_STOCK
        unitPrice: 99.99,
        supplierName: 'Logitech Distribution Co',
        lowStockThreshold: 15,
        barcode: 'ACC-LOGI-MX3S-GR',
        createdBy: adminUser._id
      },
      {
        name: 'Keychron Q1 Pro Wireless Mechanical Keyboard',
        sku: 'KEY-Q1P-RGB-RED',
        category: catMap.get('Electronics & Computers'),
        description: '75% layout, CNC aluminum body, hot-swappable red switches',
        quantity: 0, // OUT_OF_STOCK
        unitPrice: 199.00,
        supplierName: 'Keychron Global',
        lowStockThreshold: 8,
        barcode: 'KEY-Q1P-RGB-RED',
        createdBy: adminUser._id
      },

      // Office Furniture
      {
        name: 'Herman Miller Aeron Ergonomic Chair (Size B)',
        sku: 'FUR-HM-AERON-B',
        category: catMap.get('Office Furniture & Supplies'),
        description: 'Fully adjustable arms, PostureFit SL back support, Graphite finish',
        quantity: 12, // IN_STOCK
        unitPrice: 1295.00,
        supplierName: 'MillerKnoll Direct',
        lowStockThreshold: 5,
        barcode: 'FUR-HM-AERON-B',
        createdBy: adminUser._id
      },
      {
        name: 'Uplift V2 Commercial Standing Desk 72x30',
        sku: 'DESK-UPLIFT-72-WAL',
        category: catMap.get('Office Furniture & Supplies'),
        description: 'Dual motor, 355lb lifting capacity, solid walnut laminate',
        quantity: 3, // LOW_STOCK
        unitPrice: 849.00,
        supplierName: 'Uplift Desk Corp',
        lowStockThreshold: 5,
        barcode: 'DESK-UPLIFT-72-WAL',
        createdBy: adminUser._id
      },
      {
        name: 'Steelcase Mobile Pedestal 3-Drawer File Cabinet',
        sku: 'CAB-STLC-PED-WHT',
        category: catMap.get('Office Furniture & Supplies'),
        description: 'Lockable steel mobile filing unit with soft-close slides',
        quantity: 0, // OUT_OF_STOCK
        unitPrice: 320.00,
        supplierName: 'Steelcase Corporate Store',
        lowStockThreshold: 6,
        barcode: 'CAB-STLC-PED-WHT',
        createdBy: adminUser._id
      },
      {
        name: 'Heavy Duty Thermal Shipping Label Rolls (Pack of 6)',
        sku: 'SUP-LAB-4X6-RL6',
        category: catMap.get('Office Furniture & Supplies'),
        description: 'Direct thermal 4x6 labels, 500 labels per roll',
        quantity: 80, // IN_STOCK
        unitPrice: 34.50,
        supplierName: 'Avery Dennison Partner',
        lowStockThreshold: 20,
        barcode: 'SUP-LAB-4X6-RL6',
        createdBy: adminUser._id
      },

      // Warehouse
      {
        name: 'Hydraulic Heavy Duty Pallet Jack (5500 lbs)',
        sku: 'WHS-PLJ-5500-HD',
        category: catMap.get('Warehouse & Logistics'),
        description: 'Standard 48x27 inch forks, polyurethane wheels, 3-position lever',
        quantity: 5, // IN_STOCK
        unitPrice: 489.00,
        supplierName: 'Crown Equipment Corp',
        lowStockThreshold: 2,
        barcode: 'WHS-PLJ-5500-HD',
        createdBy: adminUser._id
      },
      {
        name: 'Industrial Heavy Duty Storage Bins (Pack of 12)',
        sku: 'WHS-BIN-12PK-BLU',
        category: catMap.get('Warehouse & Logistics'),
        description: 'Stackable high-density polyethylene blue storage containers',
        quantity: 2, // LOW_STOCK
        unitPrice: 119.00,
        supplierName: 'Akro-Mils Industrial',
        lowStockThreshold: 10,
        barcode: 'WHS-BIN-12PK-BLU',
        createdBy: adminUser._id
      },
      {
        name: 'Safety Steel-Toe Work Boots (Size 10.5)',
        sku: 'PPE-BOOT-105-BLK',
        category: catMap.get('Warehouse & Logistics'),
        description: 'OSHA compliant, puncture resistant, waterproof leather',
        quantity: 0, // OUT_OF_STOCK
        unitPrice: 145.00,
        supplierName: 'Red Wing Shoes Commercial',
        lowStockThreshold: 5,
        barcode: 'PPE-BOOT-105-BLK',
        createdBy: adminUser._id
      },
      {
        name: 'Stretch Wrap Heavy Duty 80 Gauge (Case of 4)',
        sku: 'WHS-WRAP-80G-4PK',
        category: catMap.get('Warehouse & Logistics'),
        description: '18 inch x 1500 ft clear cast hand film',
        quantity: 62, // IN_STOCK
        unitPrice: 68.00,
        supplierName: 'Uline Supply Partners',
        lowStockThreshold: 15,
        barcode: 'WHS-WRAP-80G-4PK',
        createdBy: adminUser._id
      },

      // Audio
      {
        name: 'Sony WH-1000XM5 Noise Canceling Headphones',
        sku: 'AUD-SONY-XM5-BLK',
        category: catMap.get('Audio & Entertainment'),
        description: 'Industry-leading ANC, 30hr battery, LDAC high-res audio',
        quantity: 24, // IN_STOCK
        unitPrice: 398.00,
        supplierName: 'Sony Wholesale North',
        lowStockThreshold: 8,
        barcode: 'AUD-SONY-XM5-BLK',
        createdBy: adminUser._id
      },
      {
        name: 'Shure SM7B Cardioid Dynamic Vocal Microphone',
        sku: 'AUD-SHURE-SM7B',
        category: catMap.get('Audio & Entertainment'),
        description: 'Legendary broadcast and studio vocal microphone with pop filter',
        quantity: 4, // LOW_STOCK
        unitPrice: 399.00,
        supplierName: 'Sweetwater Sound B2B',
        lowStockThreshold: 6,
        barcode: 'AUD-SHURE-SM7B',
        createdBy: adminUser._id
      },
      {
        name: 'Focusrite Scarlett 2i2 4th Gen Audio Interface',
        sku: 'AUD-FOC-2I2-G4',
        category: catMap.get('Audio & Entertainment'),
        description: '2-in/2-out studio audio interface with Auto Gain and Clip Safe',
        quantity: 15, // IN_STOCK
        unitPrice: 199.99,
        supplierName: 'Focusrite Americas',
        lowStockThreshold: 5,
        barcode: 'AUD-FOC-2I2-G4',
        createdBy: adminUser._id
      },

      // Networking
      {
        name: 'Ubiquiti UniFi Dream Machine Pro (UDM-Pro)',
        sku: 'NET-UBNT-UDM-PRO',
        category: catMap.get('Networking & Servers'),
        description: 'All-in-one 10G SFP+ enterprise security gateway and network appliance',
        quantity: 9, // IN_STOCK
        unitPrice: 379.00,
        supplierName: 'Ubiquiti Direct',
        lowStockThreshold: 5,
        barcode: 'NET-UBNT-UDM-PRO',
        createdBy: adminUser._id
      },
      {
        name: 'Cisco Catalyst 1000 24-Port Gigabit PoE+ Switch',
        sku: 'NET-CSCO-C1000-24P',
        category: catMap.get('Networking & Servers'),
        description: 'Enterprise managed switch, 195W PoE budget, 4x 1G SFP uplinks',
        quantity: 1, // LOW_STOCK
        unitPrice: 820.00,
        supplierName: 'Cisco Systems Commercial',
        lowStockThreshold: 4,
        barcode: 'NET-CSCO-C1000-24P',
        createdBy: adminUser._id
      },
      {
        name: 'Cat6 Pure Copper Ethernet Bulk Cable 1000ft Spool',
        sku: 'NET-CAT6-1000FT-BLU',
        category: catMap.get('Networking & Servers'),
        description: '550MHz UTP 23AWG Solid Bare Copper CMR Riser Rated',
        quantity: 32, // IN_STOCK
        unitPrice: 145.50,
        supplierName: 'Cable Matters Inc',
        lowStockThreshold: 10,
        barcode: 'NET-CAT6-1000FT-BLU',
        createdBy: adminUser._id
      }
    ];

    const insertedProducts = await ProductModel.insertMany(productsData);

    console.log('[Seed] Generating Historical Transactions...');
    const transactionLogs = [];

    for (const prod of insertedProducts) {
      if (prod.quantity > 0) {
        transactionLogs.push({
          product: prod._id,
          type: InventoryTransactionType.IN,
          quantity: prod.quantity + 5,
          previousQuantity: 0,
          newQuantity: prod.quantity + 5,
          note: 'Initial batch warehouse receipt from supplier',
          createdBy: adminUser._id,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        });

        transactionLogs.push({
          product: prod._id,
          type: InventoryTransactionType.OUT,
          quantity: 5,
          previousQuantity: prod.quantity + 5,
          newQuantity: prod.quantity,
          note: 'Fulfilled outbound client order #ORD-2026-88',
          createdBy: staffUser._id,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
      } else {
        transactionLogs.push({
          product: prod._id,
          type: InventoryTransactionType.IN,
          quantity: 10,
          previousQuantity: 0,
          newQuantity: 10,
          note: 'Initial intake shipment',
          createdBy: adminUser._id,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        });

        transactionLogs.push({
          product: prod._id,
          type: InventoryTransactionType.OUT,
          quantity: 10,
          previousQuantity: 10,
          newQuantity: 0,
          note: 'Entire stock exhausted by priority purchase order',
          createdBy: staffUser._id,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
      }
    }

    await InventoryTransactionModel.insertMany(transactionLogs);

    console.log('====================================================');
    console.log('✅ DATABASE SEEDING COMPLETE!');
    console.log('👤 Admin Credentials:  admin@inventory.com / Admin123!');
    console.log('👤 Staff Credentials:  staff@inventory.com / Staff123!');
    console.log(`📦 Categories created: ${createdCategories.length}`);
    console.log(`🏷️  Products created:   ${insertedProducts.length}`);
    console.log(`📝 Transactions created: ${transactionLogs.length}`);
    console.log('====================================================');

    process.exit(0);
  } catch (error: any) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}
