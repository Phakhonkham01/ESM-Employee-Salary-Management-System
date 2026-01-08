import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Clock, Calendar, Mail, History, Plus, Edit2, Trash2, Send } from 'lucide-react';

// Types
interface Employee {
    id: string;
    name: string;
    email: string;
    baseSalary: number;
    otHours: number;
    absentDays: number;
    leaveDays: number;
    otRate: number;
}

interface SalaryHistory {
    id: string;
    employeeId: string;
    employeeName: string;
    month: string;
    baseSalary: number;
    otHours: number;
    otPay: number;
    absentDays: number;
    absentDeduction: number;
    totalSalary: number;
    sentDate: string;
}

const Attendance: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([
        {
            id: '1',
            name: 'ນາງ ສົມສີ ວົງສະຫວັນ',
            email: 'somsee@example.com',
            baseSalary: 3000000,
            otHours: 10,
            absentDays: 0,
            leaveDays: 2,
            otRate: 20000
        },
        {
            id: '2',
            name: 'ທ້າວ ບຸນມີ ພັນທະວົງ',
            email: 'bounmee@example.com',
            baseSalary: 3500000,
            otHours: 15,
            absentDays: 1,
            leaveDays: 1,
            otRate: 25000
        },
        {
            id: '3',
            name: 'ນາງ ແສງດາວ ໄຊຍະວົງ',
            email: 'saengdao@example.com',
            baseSalary: 2800000,
            otHours: 5,
            absentDays: 0,
            leaveDays: 3,
            otRate: 18000
        }
    ]);

    const [history, setHistory] = useState<SalaryHistory[]>([]);
    const [activeTab, setActiveTab] = useState<'employees' | 'salary' | 'history'>('employees');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const [formData, setFormData] = useState<Partial<Employee>>({
        name: '',
        email: '',
        baseSalary: 0,
        otHours: 0,
        absentDays: 0,
        leaveDays: 0,
        otRate: 20000
    });

    // Calculate salary
    const calculateSalary = (emp: Employee) => {
        const otPay = emp.otHours * emp.otRate;
        const dailySalary = emp.baseSalary / 26; // Assuming 26 working days
        const absentDeduction = emp.absentDays * dailySalary;
        const totalSalary = emp.baseSalary + otPay - absentDeduction;

        return {
            otPay,
            absentDeduction,
            totalSalary
        };
    };

    // CRUD Operations
    const handleAdd = () => {
        if (formData.name && formData.email && formData.baseSalary) {
            const newEmployee: Employee = {
                id: Date.now().toString(),
                name: formData.name,
                email: formData.email,
                baseSalary: formData.baseSalary,
                otHours: formData.otHours || 0,
                absentDays: formData.absentDays || 0,
                leaveDays: formData.leaveDays || 0,
                otRate: formData.otRate || 20000
            };
            setEmployees([...employees, newEmployee]);
            setFormData({ name: '', email: '', baseSalary: 0, otHours: 0, absentDays: 0, leaveDays: 0, otRate: 20000 });
            setShowAddForm(false);
        }
    };

    const handleEdit = (id: string) => {
        const emp = employees.find(e => e.id === id);
        if (emp) {
            setFormData(emp);
            setEditingId(id);
            setShowAddForm(true);
        }
    };

    const handleUpdate = () => {
        if (editingId && formData.name && formData.email && formData.baseSalary) {
            setEmployees(employees.map(emp =>
                emp.id === editingId ? { ...emp, ...formData } as Employee : emp
            ));
            setFormData({ name: '', email: '', baseSalary: 0, otHours: 0, absentDays: 0, leaveDays: 0, otRate: 20000 });
            setEditingId(null);
            setShowAddForm(false);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('ທ່ານຕ້ອງການລົບພະນັກງານນີ້ແທ້ບໍ? / Are you sure you want to delete this employee?')) {
            setEmployees(employees.filter(emp => emp.id !== id));
        }
    };

    // Send email to individual employee
    const sendToEmployee = (emp: Employee) => {
        const { otPay, absentDeduction, totalSalary } = calculateSalary(emp);
        const emailBody = `
ສະບາຍດີ ${emp.name},

ຂໍ້ມູນເງິນເດືອນ ແລະ ວັນພັກຂອງທ່ານປະຈຳເດືອນ ${selectedMonth}:

📊 ລາຍລະອຽດເງິນເດືອນ:
- ເງິນເດືອນພື້ນຖານ: ${emp.baseSalary.toLocaleString()} ກີບ
- ຊົ່ວໂມງ OT: ${emp.otHours} ຊົ່ວໂມງ (${otPay.toLocaleString()} ກີບ)
- ວັນຂາດງານ: ${emp.absentDays} ມື້ (-${absentDeduction.toLocaleString()} ກີບ)
- ວັນລາພັກ: ${emp.leaveDays} ມື້

💰 ເງິນເດືອນທັງໝົດ: ${totalSalary.toLocaleString()} ກີບ

ຂອບໃຈ,
ພະແນກບຸກຄະລາກອນ
    `.trim();

        const mailtoLink = `mailto:${emp.email}?subject=Salary Information - ${selectedMonth}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoLink;

        // Add to history
        const historyEntry: SalaryHistory = {
            id: Date.now().toString(),
            employeeId: emp.id,
            employeeName: emp.name,
            month: selectedMonth,
            baseSalary: emp.baseSalary,
            otHours: emp.otHours,
            otPay,
            absentDays: emp.absentDays,
            absentDeduction,
            totalSalary,
            sentDate: new Date().toISOString()
        };
        setHistory([historyEntry, ...history]);
    };

    // Send email to all employees
    const sendToAll = () => {
        if (employees.length === 0) {
            alert('ບໍ່ມີຂໍ້ມູນພະນັກງານ / No employees found');
            return;
        }

        const emailList = employees.map(emp => emp.email).join(',');
        let emailBody = `ສະບາຍດີທຸກທ່ານ,\n\nຂໍ້ມູນເງິນເດືອນ ແລະ ວັນພັກປະຈຳເດືອນ ${selectedMonth}:\n\n`;

        employees.forEach(emp => {
            const { otPay, absentDeduction, totalSalary } = calculateSalary(emp);
            emailBody += `
📌 ${emp.name}:
- ເງິນເດືອນພື້ນຖານ: ${emp.baseSalary.toLocaleString()} ກີບ
- OT: ${emp.otHours}ຊມ (${otPay.toLocaleString()} ກີບ)
- ຂາດງານ: ${emp.absentDays}ມື້ (-${absentDeduction.toLocaleString()} ກີບ)
- ລາພັກ: ${emp.leaveDays}ມື້
- ລວມທັງໝົດ: ${totalSalary.toLocaleString()} ກີບ
\n`;
        });

        emailBody += '\nຂອບໃຈ,\nພະແນກບຸກຄະລາກອນ';

        const mailtoLink = `mailto:${emailList}?subject=Monthly Salary Report - ${selectedMonth}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoLink;

        // Add all to history
        const newHistoryEntries: SalaryHistory[] = employees.map(emp => {
            const { otPay, absentDeduction, totalSalary } = calculateSalary(emp);
            return {
                id: `${Date.now()}-${emp.id}`,
                employeeId: emp.id,
                employeeName: emp.name,
                month: selectedMonth,
                baseSalary: emp.baseSalary,
                otHours: emp.otHours,
                otPay,
                absentDays: emp.absentDays,
                absentDeduction,
                totalSalary,
                sentDate: new Date().toISOString()
            };
        });
        setHistory([...newHistoryEntries, ...history]);
    };

    return (
        <div className="">
            <div className="max-w-7xl mx-auto">
                {/* Navigation Tabs */}
                <div className="bg-white rounded-lg shadow-lg mb-6">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('salary')}
                            className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'salary'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-600 hover:text-indigo-600'
                                }`}
                        >
                            <DollarSign size={20} />
                            ຄຳນວນເງິນເດືອນ / Salary
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'history'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-600 hover:text-indigo-600'
                                }`}
                        >
                            <History size={20} />
                            ປະຫວັດການສົ່ງ / History
                        </button>
                    </div>
                </div>

                {/* Employees Tab */}
                {activeTab === 'employees' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">ຂໍ້ມູນພະນັກງານ</h2>
                            <button
                                onClick={() => {
                                    setShowAddForm(true);
                                    setEditingId(null);
                                    setFormData({ name: '', email: '', baseSalary: 0, otHours: 0, absentDays: 0, leaveDays: 0, otRate: 20000 });
                                }}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                            >
                                <Plus size={20} />
                                ເພີ່ມພະນັກງານ
                            </button>
                        </div>

                        {/* Popup Modal for Add/Edit */}
                        {showAddForm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                    <div className="sticky top-0 bg-indigo-600 text-white p-6 rounded-t-lg">
                                        <h3 className="text-2xl font-bold">
                                            {editingId ? '✏️ ແກ້ໄຂຂໍ້ມູນພະນັກງານ / Edit Employee' : '➕ ເພີ່ມພະນັກງານໃໝ່ / Add New Employee'}
                                        </h3>
                                    </div>

                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    ຊື່ພະນັກງານ / Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="ກະລຸນາໃສ່ຊື່"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    ອີເມວ / Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    placeholder="example@email.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    ເງິນເດືອນພື້ນຖານ / Base Salary (LAK) *
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="3000000"
                                                    value={formData.baseSalary || ''}
                                                    onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    ອັດຕາ OT ຕໍ່ຊົ່ວໂມງ / OT Rate/Hour (LAK)
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="20000"
                                                    value={formData.otRate || ''}
                                                    onChange={(e) => setFormData({ ...formData, otRate: Number(e.target.value) })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    ຊົ່ວໂມງ OT / OT Hours
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={formData.otHours || ''}
                                                    onChange={(e) => setFormData({ ...formData, otHours: Number(e.target.value) })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    ວັນຂາດງານ / Absent Days
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={formData.absentDays || ''}
                                                    onChange={(e) => setFormData({ ...formData, absentDays: Number(e.target.value) })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    ວັນລາພັກ / Leave Days
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={formData.leaveDays || ''}
                                                    onChange={(e) => setFormData({ ...formData, leaveDays: Number(e.target.value) })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-6 pt-6 border-t">
                                            <button
                                                onClick={editingId ? handleUpdate : handleAdd}
                                                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                            >
                                                {editingId ? '💾 ອັບເດດ / Update' : '💾 ບັນທຶກ / Save'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowAddForm(false);
                                                    setEditingId(null);
                                                    setFormData({ name: '', email: '', baseSalary: 0, otHours: 0, absentDays: 0, leaveDays: 0, otRate: 20000 });
                                                }}
                                                className="flex-1 bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition-colors font-medium"
                                            >
                                                ❌ ຍົກເລີກ / Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Employee List */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left">ຊື່ / Name</th>
                                        <th className="px-4 py-3 text-left">ອີເມວ / Email</th>
                                        <th className="px-4 py-3 text-right">ເງິນເດືອນ / Salary</th>
                                        <th className="px-4 py-3 text-center">OT (ຊມ)</th>
                                        <th className="px-4 py-3 text-center">ຂາດ (ມື້)</th>
                                        <th className="px-4 py-3 text-center">ລາ (ມື້)</th>
                                        <th className="px-4 py-3 text-center">ຈັດການ / Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3">{emp.name}</td>
                                            <td className="px-4 py-3">{emp.email}</td>
                                            <td className="px-4 py-3 text-right">{emp.baseSalary.toLocaleString()} ກີບ</td>
                                            <td className="px-4 py-3 text-center">{emp.otHours}</td>
                                            <td className="px-4 py-3 text-center">{emp.absentDays}</td>
                                            <td className="px-4 py-3 text-center">{emp.leaveDays}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(emp.id)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(emp.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Salary Tab */}
                {activeTab === 'salary' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">ຄຳນວນເງິນເດືອນ</h2>
                            <div className="flex gap-3">
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={sendToAll}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                                >
                                    <Mail size={20} />
                                    ສົ່ງໃຫ້ທຸກຄົນ / Send to All
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {employees.map((emp) => {
                                const { otPay, absentDeduction, totalSalary } = calculateSalary(emp);
                                return (
                                    <div key={emp.id} className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">{emp.name}</h3>
                                                <p className="text-gray-600">{emp.email}</p>
                                            </div>
                                            <button
                                                onClick={() => sendToEmployee(emp)}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                                            >
                                                <Send size={18} />
                                                ສົ່ງ / Send
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-white p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">ເງິນເດືອນພື້ນຖານ</p>
                                                <p className="text-lg font-bold text-gray-800">{emp.baseSalary.toLocaleString()} ກີບ</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">OT ({emp.otHours} ຊມ)</p>
                                                <p className="text-lg font-bold text-green-600">+{otPay.toLocaleString()} ກີບ</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">ຂາດງານ ({emp.absentDays} ມື້)</p>
                                                <p className="text-lg font-bold text-red-600">-{absentDeduction.toLocaleString()} ກີບ</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">ລາພັກ</p>
                                                <p className="text-lg font-bold text-blue-600">{emp.leaveDays} ມື້</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 bg-indigo-600 text-white p-4 rounded-lg">
                                            <p className="text-sm">ເງິນເດືອນທັງໝົດ / Total Salary</p>
                                            <p className="text-3xl font-bold">{totalSalary.toLocaleString()} ກີບ</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">ປະຫວັດການສົ່ງເງິນເດືອນ</h2>

                        {history.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <History size={48} className="mx-auto mb-4 opacity-50" />
                                <p>ຍັງບໍ່ມີປະຫວັດການສົ່ງເງິນເດືອນ</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left">ຊື່ / Name</th>
                                            <th className="px-4 py-3 text-center">ເດືອນ / Month</th>
                                            <th className="px-4 py-3 text-right">ເງິນເດືອນພື້ນຖານ</th>
                                            <th className="px-4 py-3 text-center">OT</th>
                                            <th className="px-4 py-3 text-right">ລວມ / Total</th>
                                            <th className="px-4 py-3 text-center">ວັນທີສົ່ງ / Sent Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((record) => (
                                            <tr key={record.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3">{record.employeeName}</td>
                                                <td className="px-4 py-3 text-center">{record.month}</td>
                                                <td className="px-4 py-3 text-right">{record.baseSalary.toLocaleString()} ກີບ</td>
                                                <td className="px-4 py-3 text-center">{record.otHours}ຊມ</td>
                                                <td className="px-4 py-3 text-right font-bold text-indigo-600">
                                                    {record.totalSalary.toLocaleString()} ກີບ
                                                </td>
                                                <td className="px-4 py-3 text-center text-sm text-gray-600">
                                                    {new Date(record.sentDate).toLocaleString('lo-LA')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attendance;