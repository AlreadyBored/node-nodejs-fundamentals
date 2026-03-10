const dynamic = async () => {
  // Write your code here
  // Accept plugin name as CLI argument
  // Dynamically import plugin from plugins/ directory
  // Call run() function and print result
  // Handle missing plugin case

  const command = process.argv[2];
  const module = await import(`./plugins/${command}.js`);
  console.log(module.run());
};

await dynamic();
