/**
 * Database Seed Script
 *
 * CONCEPT: Seeding populates the database with initial data.
 * This script imports data from data.json into MongoDB.
 *
 * RUN: npm run seed (from server folder)
 *
 * What it does:
 * 1. Clears existing data
 * 2. Creates a demo user account
 * 3. Imports transactions, budgets, and pots from data.json
 *
 * Demo Account:
 *   Email: demo@example.com
 *   Password: password123
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, disconnectDB } from '../config/db.js';
import { User, Transaction, Budget, Pot } from '../models/index.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to data.json (relative to project root)
const DATA_PATH = path.join(__dirname, '../../..', 'data.json');

interface DataJson {
  balance: {
    current: number;
    income: number;
    expenses: number;
  };
  transactions: Array<{
    avatar: string;
    name: string;
    category: string;
    date: string;
    amount: number;
    recurring: boolean;
  }>;
  budgets: Array<{
    category: string;
    maximum: number;
    theme: string;
  }>;
  pots: Array<{
    name: string;
    target: number;
    total: number;
    theme: string;
  }>;
}

async function seed(): Promise<void> {
  console.log('🌱 Starting database seed...\n');

  try {
    // Connect to database
    await connectDB();

    // Read data.json
    console.log('📖 Reading data.json...');
    const dataPath = DATA_PATH;
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data: DataJson = JSON.parse(rawData);
    console.log('✅ Data loaded\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Transaction.deleteMany({}),
      Budget.deleteMany({}),
      Pot.deleteMany({}),
    ]);
    console.log('✅ Existing data cleared\n');

    // Create demo user
    console.log('👤 Creating demo user...');
    const user = await User.create({
      email: 'demo@example.com',
      password: 'password123',
      fullName: 'Demo User',
      balance: data.balance.current,
      verified: true,
      authProvider: 'local',
    });
    console.log(`✅ User created: ${user.email}\n`);

    // Import transactions
    console.log('💳 Importing transactions...');
    const transactions = data.transactions.map((tx) => ({
      userId: user._id,
      avatar: tx.avatar,
      name: tx.name,
      category: tx.category,
      date: new Date(tx.date),
      amount: tx.amount,
      recurring: tx.recurring,
    }));
    await Transaction.insertMany(transactions);
    console.log(`✅ ${transactions.length} transactions imported\n`);

    // Import budgets
    console.log('📊 Importing budgets...');
    const budgets = data.budgets.map((budget) => ({
      userId: user._id,
      category: budget.category,
      maximum: budget.maximum,
      theme: budget.theme,
    }));
    await Budget.insertMany(budgets);
    console.log(`✅ ${budgets.length} budgets imported\n`);

    // Import pots
    console.log('🏺 Importing pots...');
    const pots = data.pots.map((pot) => ({
      userId: user._id,
      name: pot.name,
      target: pot.target,
      total: pot.total,
      theme: pot.theme,
    }));
    await Pot.insertMany(pots);
    console.log(`✅ ${pots.length} pots imported\n`);

    // Summary
    console.log('='.repeat(50));
    console.log('🎉 Seed completed successfully!');
    console.log('='.repeat(50));
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - User: ${user.email}`);
    console.log(`   - Password: password123`);
    console.log(`   - Balance: $${data.balance.current.toFixed(2)}`);
    console.log(`   - Transactions: ${transactions.length}`);
    console.log(`   - Budgets: ${budgets.length}`);
    console.log(`   - Pots: ${pots.length}`);
    console.log('');
    console.log('🔐 Login with:');
    console.log('   Email: demo@example.com');
    console.log('   Password: password123');
    console.log('');
    console.log('🔗 You can now start the server: npm run dev');
    console.log('');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// Run the seed
seed();
