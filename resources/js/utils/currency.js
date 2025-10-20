// resources/js/utils/currency.js
export const formatCedis = (value) => {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(value || 0);
};