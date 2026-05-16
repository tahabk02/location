import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";

const getAgencyMatch = (req) => {
  if (req.user.role === "superadmin") return {};
  const agencyId = req.user.agencyId || "default";
  return { $or: [{ agencyId }, { agencyId: { $exists: false } }] };
};

export const getFinancialSummary = async (req, res) => {
  try {
    const bookings = getCollection("bookings");
    const expenses = getCollection("expenses");
    const match = getAgencyMatch(req);

    // Total Revenue (only confirmed bookings)
    const revenueData = await bookings.aggregate([
      { $match: { ...match, status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]).toArray();

    // Total Expenses
    const expenseData = await expenses.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]).toArray();

    const revenue = revenueData[0]?.total || 0;
    const bookingCount = revenueData[0]?.count || 0;
    const totalExpenses = expenseData[0]?.total || 0;
    const expenseCount = expenseData[0]?.count || 0;
    const netProfit = revenue - totalExpenses;

    // Monthly Growth (this month vs last month)
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthRevenue = await bookings.aggregate([
      { $match: { ...match, status: "confirmed", createdAt: { $gte: firstDayThisMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]).toArray();

    const lastMonthRevenue = await bookings.aggregate([
      { $match: { ...match, status: "confirmed", createdAt: { $gte: firstDayLastMonth, $lt: firstDayThisMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]).toArray();

    const thisMonthVal = thisMonthRevenue[0]?.total || 0;
    const lastMonthVal = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthVal === 0 ? 100 : ((thisMonthVal - lastMonthVal) / lastMonthVal) * 100;

    res.json({
      summary: {
        revenue,
        bookingCount,
        totalExpenses,
        expenseCount,
        netProfit,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching financial summary", error: error.message });
  }
};

export const getMonthlyStats = async (req, res) => {
  try {
    const bookings = getCollection("bookings");
    const expenses = getCollection("expenses");
    const match = getAgencyMatch(req);

    // Monthly Revenue & Bookings
    const revenueStats = await bookings.aggregate([
      { $match: { ...match, status: "confirmed" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$startDate" } } },
          revenue: { $sum: "$totalAmount" },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Monthly Expenses
    const expenseStats = await expenses.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
          expenses: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Merge results
    const months = [...new Set([...revenueStats.map(r => r._id), ...expenseStats.map(e => e._id)])].sort();
    const chartData = months.map(month => {
      const r = revenueStats.find(x => x._id === month);
      const e = expenseStats.find(x => x._id === month);
      return {
        month,
        revenue: r?.revenue || 0,
        bookings: r?.bookings || 0,
        expenses: e?.expenses || 0,
        profit: (r?.revenue || 0) - (e?.expenses || 0)
      };
    });

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching monthly stats", error: error.message });
  }
};

export const getCarPerformance = async (req, res) => {
  try {
    const bookings = getCollection("bookings");
    const expenses = getCollection("expenses");
    const cars = getCollection("cars");
    const match = getAgencyMatch(req);

    const carList = await cars.find(match).toArray();

    const performance = await Promise.all(carList.map(async (car) => {
      const carRevenue = await bookings.aggregate([
        { $match: { ...match, carId: car._id, status: "confirmed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
      ]).toArray();

      const carExpenses = await expenses.aggregate([
        { $match: { ...match, carId: car._id.toString() } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]).toArray();

      const rev = carRevenue[0]?.total || 0;
      const exp = carExpenses[0]?.total || 0;

      return {
        carId: car._id,
        name: `${car.brand} ${car.model}`,
        revenue: rev,
        expenses: exp,
        profit: rev - exp,
        bookingCount: carRevenue[0]?.count || 0,
        available: car.available,
        status: car.status
      };
    }));

    res.json(performance.sort((a, b) => b.profit - a.profit));
  } catch (error) {
    res.status(500).json({ message: "Error fetching car performance", error: error.message });
  }
};

export const getExpenseBreakdown = async (req, res) => {
  try {
    const expenses = getCollection("expenses");
    const match = getAgencyMatch(req);

    const breakdown = await expenses.aggregate([
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]).toArray();

    res.json(breakdown.map(item => ({
      category: item._id,
      total: item.total,
      count: item.count
    })));
  } catch (error) {
    res.status(500).json({ message: "Error fetching expense breakdown", error: error.message });
  }
};
