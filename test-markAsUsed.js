// Quick test to verify markAsUsed behavior
const testMarkAsUsed = () => {
  console.log('Testing markAsUsed calculation:');
  
  const currentQuantity = 1;
  const quantityUsed = 0.5;
  const newQuantity = Math.max(0, currentQuantity - quantityUsed);
  
  console.log('Current quantity:', currentQuantity);
  console.log('Quantity used:', quantityUsed);
  console.log('New quantity:', newQuantity);
  console.log('Expected: 0.5');
  console.log('Match:', newQuantity === 0.5);
};

testMarkAsUsed();
