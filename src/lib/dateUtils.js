function formatDateAsHTML(date) {
  const formattedDate = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDay()}`;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDay() + 1}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

module.exports = { formatDateAsHTML };
