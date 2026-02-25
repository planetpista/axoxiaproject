import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Download, Filter, Calendar } from 'lucide-react';
import { FinancialRecord } from '../../types/admin';
import { format } from 'date-fns';

interface FinancialTrackingProps {
  financialRecords: FinancialRecord[];
  onExportReport: (filters: any) => void;
}

const FinancialTracking: React.FC<FinancialTrackingProps> = ({
  financialRecords,
  onExportReport
}) => {
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Calculate financial metrics
  const totalRevenue = financialRecords
    .filter(record => record.type === 'revenue' && record.paymentStatus === 'completed')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalCosts = financialRecords
    .filter(record => record.type === 'cost')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalRefunds = financialRecords
    .filter(record => record.type === 'refund')
    .reduce((sum, record) => sum + record.amount, 0);

  const netProfit = totalRevenue - totalCosts - totalRefunds;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Revenue by service type (mock data for demo)
  const revenueByService = [
    { name: 'Mail', value: totalRevenue * 0.3, color: '#8B5CF6' },
    { name: 'Parcel', value: totalRevenue * 0.5, color: '#10B981' },
    { name: 'Container', value: totalRevenue * 0.2, color: '#F59E0B' }
  ];

  // Monthly revenue trend (mock data for demo)
  const monthlyRevenue = [
    { month: 'Jan', revenue: 15000, costs: 8000, profit: 7000 },
    { month: 'Feb', revenue: 18000, costs: 9500, profit: 8500 },
    { month: 'Mar', revenue: 22000, costs: 11000, profit: 11000 },
    { month: 'Apr', revenue: 19000, costs: 10200, profit: 8800 },
    { month: 'May', revenue: 25000, costs: 12500, profit: 12500 },
    { month: 'Jun', revenue: 28000, costs: 13800, profit: 14200 }
  ];

  const MetricCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {change >= 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Financial Tracking</h1>
        <div className="flex gap-3">
          <button
            onClick={() => onExportReport({ dateRange, period: selectedPeriod })}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Download size={20} />
            Export Report
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-400" />
            <span className="font-medium text-gray-700">Date Range:</span>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`€${totalRevenue.toLocaleString()}`}
          change={15}
          icon={DollarSign}
          color="bg-green-500"
        />
        <MetricCard
          title="Total Costs"
          value={`€${totalCosts.toLocaleString()}`}
          change={8}
          icon={TrendingDown}
          color="bg-red-500"
        />
        <MetricCard
          title="Net Profit"
          value={`€${netProfit.toLocaleString()}`}
          change={22}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <MetricCard
          title="Profit Margin"
          value={`${profitMargin.toFixed(1)}%`}
          change={5}
          icon={TrendingUp}
          color="bg-blue-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Profit Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`€${value}`, '']} />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="profit" stroke="#8B5CF6" strokeWidth={2} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Service */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByService}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueByService.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`€${value}`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Cost vs Revenue</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`€${value}`, '']} />
            <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
            <Bar dataKey="costs" fill="#EF4444" name="Costs" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <button className="flex items-center gap-2 px-3 py-1 text-sm text-purple-600 hover:text-purple-700">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {financialRecords.slice(0, 10).map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(record.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.type === 'revenue' ? 'bg-green-100 text-green-800' :
                      record.type === 'cost' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={record.type === 'revenue' ? 'text-green-600' : 'text-red-600'}>
                      {record.type === 'revenue' ? '+' : '-'}€{record.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      record.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      record.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialTracking;