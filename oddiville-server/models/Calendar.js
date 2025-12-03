module.exports = (sequelize, Sequelize) => {
    const Calendar = sequelize.define(
      "Calendar",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        product_name: { type: Sequelize.STRING, allowNull: false },
        work_area: { type: Sequelize.STRING, allowNull: false },
        scheduled_date: { type: Sequelize.DATE, allowNull: false },
        start_time: { type: Sequelize.STRING, allowNull: false },
        end_time: { type: Sequelize.STRING, allowNull: false },
        reminder_24h_job_id: { type: Sequelize.STRING, allowNull: true },
      },
      { timestamps: true }
    );

    return Calendar;
}