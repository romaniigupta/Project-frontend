
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Calendar.css';

const Calendar = () => {
  const [holidays, setHolidays] = useState([]);
  const [countries, setCountries] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [country, setCountry] = useState('IN');
  const [view, setView] = useState('monthly'); 
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

 
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/holidays/countries');
        setCountries(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCountries();
  }, []);

  
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/holidays`, {
          params: { country, year }
        });
        setHolidays(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHolidays();
  }, [year, country]);

  const getHolidaysByMonth = (month) =>
    holidays.filter(h => new Date(h.date).getMonth() + 1 === month);

  const splitWeeks = (month) => {
    const firstDay = new Date(year, month-1, 1);
    const lastDay = new Date(year, month, 0);
    const weeks = [];
    let week = [];
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month-1, d);
      week.push(date);
      if (date.getDay() === 6 || d === lastDay.getDate()) {
        weeks.push(week);
        week = [];
      }
    }
    return weeks;
  };

  const renderWeekRow = (days) => {
    const holidayCount = days.filter(d =>
      getHolidaysByMonth(d.getMonth() + 1).some(h => new Date(h.date).getDate() === d.getDate())
    ).length;

    const bgColor = holidayCount > 1 ? 'darkgreen' : holidayCount === 1 ? 'lightgreen' : '';

    return (
      <div className="week-row" key={days[0]}>
        {days.map(d => {
          const dayHolidays = getHolidaysByMonth(d.getMonth() + 1)
            .filter(h => new Date(h.date).getDate() === d.getDate());
          const isToday = d.toDateString() === new Date().toDateString();

          return (
            <div
              className={`day ${isToday ? 'day-today' : ''}`}
              style={{ backgroundColor: bgColor }}
              key={d.toISOString()}
            >
              {d.getDate()}
              {dayHolidays.map((h,i) => (
                <div key={i} className="holiday-name">{h.name}</div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonth = (month) => {
    const weeks = splitWeeks(month);
    return (
      <div className="month-container" key={month}>
        <h3>{months[month-1]}</h3>
        <div className="week-header">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div>
          <div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        {weeks.map(w => renderWeekRow(w))}
      </div>
    );
  };

  const renderQuarterlyView = () => {
    const quarters = [
      [1,2,3],
      [4,5,6],
      [7,8,9],
      [10,11,12]
    ];
    return quarters.map((q, i) => (
      <div className="quarter-row" key={i}>
        {q.map(m => renderMonth(m))}
      </div>
    ));
  };

  const getHolidaysByQuarter = (quarter) => {
    const quarterMonths = [
      [1,2,3],
      [4,5,6],
      [7,8,9],
      [10,11,12]
    ];
    const monthsInQuarter = quarterMonths[quarter - 1];
    return monthsInQuarter.map(m => ({
      month: months[m-1],
      holidays: getHolidaysByMonth(m)
    }));
  };

  const holidayIndex = view === 'monthly'
    ? getHolidaysByMonth(monthFilter)
    : getHolidaysByQuarter(Math.ceil(monthFilter / 3));

  return (
    <div>
      <div className="controls">
        <label>Year:
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} />
        </label>

        <label>Month:
          <select value={monthFilter} onChange={e => setMonthFilter(Number(e.target.value))}>
            {months.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
        </label>

        <label>Country:
          <select value={country} onChange={e => setCountry(e.target.value)}>
            {countries.map(c => (
              <option key={c.countryCode} value={c.countryCode}>{c.name}</option>
            ))}
          </select>
        </label>

        <label>View:
          <select value={view} onChange={e => setView(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </label>
      </div>

      {view === 'monthly'
        ? <div className="year-calendar">{renderMonth(monthFilter)}</div>
        : <div className="year-calendar">{renderQuarterlyView()}</div>
      }

      <div className="holiday-index">
        {view === 'monthly' && (
          <>
            <h3>Holidays in {months[monthFilter-1]}</h3>
            <ul>
              {holidayIndex.map((h,i) => (
                <li key={i}>{h.date}: {h.name}</li>
              ))}
            </ul>
          </>
        )}
        {view === 'quarterly' && (
          <>
            <h3>Holidays in Quarter</h3>
            {holidayIndex.map((m,i) => (
              <div key={i}>
                <strong>{m.month}</strong>
                <ul>
                  {m.holidays.map((h,j) => (
                    <li key={j}>{h.date}: {h.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-color legend-lightgreen"></div>
          <span>1 holiday in week</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-darkgreen"></div>
          <span>More than 1 holiday in week</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
