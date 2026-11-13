import { formatTime } from '../utils';

// Debug challenge fix: remarks are not their own column. They live inside all_data,
// which the API sends as a JSON *string*, so it has to be parsed here first.
function getRemarks(allData) {
  try {
    return JSON.parse(allData).OpenHouseRemarks || '';
  } catch {
    return ''; // missing or bad JSON
  }
}

// "2026-09-27T07:00:00.000Z" -> "Sunday, September 27, 2026"
function formatDate(value) {
  const date = new Date(value);
  if (isNaN(date)) return 'Date TBD';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function OpenHouses({ openHouses }) {
  if (openHouses.length === 0) return <p>No open houses scheduled</p>;

  return (
    <ul className="open-houses">
      {openHouses.map((oh) => {
        const remarks = getRemarks(oh.all_data);
        return (
          <li key={oh.id}>
            <strong>{formatDate(oh.OpenHouseDate)}</strong>
            <span>{formatTime(oh.OH_StartTime)} - {formatTime(oh.OH_EndTime)}</span>
            {remarks && <p>{remarks}</p>}
          </li>
        );
      })}
    </ul>
  );
}
