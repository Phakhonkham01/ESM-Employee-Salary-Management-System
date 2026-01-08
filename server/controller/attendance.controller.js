const Attendance = require("../model/Attendance");

const STANDARD_HOURS = 8;

exports.createOrUpdate = async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, note } = req.body;

    let workingHours = 0;
    let otHours = 0;
    let otType = "NONE";

    if (checkIn && checkOut) {
      const diff =
        (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);

      workingHours = Math.max(diff, 0);

      if (workingHours > STANDARD_HOURS) {
        otHours = workingHours - STANDARD_HOURS;

        const day = new Date(date).getDay();
        otType = day === 0 || day === 6 ? "WEEKEND" : "WEEKDAY";
      }
    }

    const record = await Attendance.findOneAndUpdate(
      { employee: employeeId, date },
      {
        employee: employeeId,
        date,
        checkIn,
        checkOut,
        workingHours,
        otHours,
        otType,
        status,
        note,
        createdBy: req.user.id
      },
      { upsert: true, new: true }
    );

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
