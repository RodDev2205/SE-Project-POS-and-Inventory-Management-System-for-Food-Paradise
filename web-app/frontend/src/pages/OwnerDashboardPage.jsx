import React from 'react';
import { useOutletContext } from 'react-router-dom';
import SalesCard from "../components/dashboard/SalesCard";
import BranchPerformance from '../components/dashboard/BranchPerformance';
import TopMenu from '../components/dashboard/TopMenu';
import LowStockAlert from '../components/dashboard/LowStockAlert';
import VoidedTransaction from '../components/dashboard/VoidTransaction';

export default function DashboardPage() {
    const { 
        salesData = {}, 
        branchPerformance = [], 
        topItems = [], 
        lowStockItems = [], 
        voidedTransactions = []
    } = useOutletContext() || {};
    
    return (
        <div className="p-6 bg-gray-100 min-h-screen shadow-lg">
        <div className="space-y-6">
             <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
            {/* Sales Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <SalesCard title="Today's Sales" amount={salesData?.today} />
                <SalesCard 
                    title="Weekly Sales"
                    amount={salesData?.weekly}
                    colorClass="bg-yellow-50 border-yellow-200"
                    textColorClass="text-yellow-700"
                />
                <SalesCard 
                    title="Monthly Sales"
                    amount={salesData?.monthly}
                    colorClass="bg-red-50 border-red-200"
                    textColorClass="text-red-700"
                />
                <SalesCard
                    title="Yearly Sales"
                    amount={salesData?.yearly}
                    colorClass="bg-blue-50 border-blue-200"
                    textColorClass="text-blue-700"
                />
            </div>
            
            {/* Branch Performance and Top Menu Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BranchPerformance branchPerformance={branchPerformance} />
                <TopMenu topItems={topItems} />
            </div>

                        {/* Low Stock and Voided Transactions */}
                         <LowStockAlert lowStockItems={lowStockItems} />
                         <VoidedTransaction voidedTransactions={voidedTransactions} />
                    </div>
                 </div>
    );
}