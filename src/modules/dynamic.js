import { argv } from "node:process";

const dynamic = async () => {
  const args = argv.slice(2);

  if (!args.length || args.length === 0) throw new Error("unknown argument");

  const { run } = await import(`./plugins/${args[0]}`).catch(() => {
    throw new Error("Plugin not found");
  });

  console.log(run());
};

await dynamic();
