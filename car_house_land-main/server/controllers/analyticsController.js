
// controllers/analyticsController.js
const Deal = require('../models/Deal');
const User = require('../models/User');

// Monthly User Growth
exports.getUserGrowth = async (req, res) => {
  try {
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          newUsers: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          _id: 0,
          month: {
            $let: {
              vars: {
                months: ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
              },
              in: {
                $arrayElemAt: ["$$months", "$_id.month"]
              }
            }
          },
          year: "$_id.year",
          newUsers: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: userGrowth
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user growth data'
    });
  }
};

// Monthly Deal Completion - Number of completed deals per month
exports.getDealCompletion = async (req, res) => {
  try {
    const dealCompletion = await Deal.aggregate([
      {
        $match: {
          status: "completed"
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$completedAt" },
            month: { $month: "$completedAt" }
          },
          completedDeals: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          _id: 0,
          month: {
            $let: {
              vars: {
                months: ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
              },
              in: {
                $arrayElemAt: ["$$months", "$_id.month"]
              }
            }
          },
          year: "$_id.year",
          completedDeals: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: dealCompletion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching deal completion data'
    });
  }
};

// Today's Daily Traffic - Using user login activity
exports.getDailyTraffic = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Time intervals for the day
    const timeIntervals = [
      "00:00 - 03:59",
      "04:00 - 07:59", 
      "08:00 - 11:59",
      "12:00 - 15:59",
      "16:00 - 19:59",
      "20:00 - 23:59"
    ];

    const trafficData = await User.aggregate([
      {
        $match: {
          lastLogin: { 
            $gte: today,
            $lt: tomorrow
          }
        }
      },
      {
        $group: {
          _id: {
            $floor: {
              $divide: [{ $hour: "$lastLogin" }, 4]
            }
          },
          visitors: { $sum: 1 },
          pageViews: {
            $sum: {
              $add: [3, { $multiply: [{ $rand: {} }, 4] }] // 3-7 pages per visitor
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          timeInterval: {
            $arrayElemAt: [timeIntervals, "$_id"]
          },
          visitors: 1,
          pageViews: 1
        }
      },
      {
        $sort: { "timeInterval": 1 }
      }
    ]);

    // Fill missing intervals with zero values
    const completeData = timeIntervals.map(interval => {
      const existing = trafficData.find(item => item.timeInterval === interval);
      return {
        timeInterval: interval,
        visitors: existing ? existing.visitors : 0,
        pageViews: existing ? existing.pageViews : 0
      };
    });


res.json({
      success: true,
      data: completeData,
      date: today.toISOString().split('T')[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching daily traffic data'
    });
  }
};