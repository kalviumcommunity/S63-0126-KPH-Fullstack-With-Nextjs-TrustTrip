// Test file to demonstrate linting and pre-commit hooks
export const testFunction = () => {
  const unused_var = 5;
  console.log("This should trigger a warning");
  return "test";
};
