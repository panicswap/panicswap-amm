export const formatNumber = (number, maxDecimal) => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxDecimal,
  }).format(number);
};
