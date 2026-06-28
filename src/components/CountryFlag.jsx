export const CountryFlag = ({ countryId, className, style }) => {
  if (!countryId) return null;
  return (
    <img 
      src={`https://flagcdn.com/w40/${countryId.toLowerCase()}.png`} 
      alt=""
      className={className}
      style={{ 
        width: '20px', 
        height: '13px', 
        objectFit: 'cover', 
        borderRadius: '2px', 
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style 
      }} 
      onError={(e) => {
        e.target.style.display = 'none';
      }}
    />
  );
};

export default CountryFlag;
