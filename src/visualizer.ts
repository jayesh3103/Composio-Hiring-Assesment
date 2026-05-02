import fs from "fs/promises";

async function main() {
  const data = await fs.readFile("dependencies.json", "utf8");
  const dependencies = JSON.parse(data);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Composio Tool Dependencies</title>
  <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <style type="text/css">
    body { font-family: sans-serif; margin: 0; padding: 0; }
    h1 { text-align: center; }
    #mynetwork {
      width: 100vw;
      height: 90vh;
      border: 1px solid lightgray;
    }
  </style>
</head>
<body>
<h1>Composio Tool Dependency Graph</h1>
<div id="mynetwork"></div>
<script type="text/javascript">
  const dependencies = ${JSON.stringify(dependencies)};
  
  const nodes = new vis.DataSet();
  const edges = new vis.DataSet();

  const nodeSet = new Set();
  dependencies.edges.forEach(e => {
    if(!nodeSet.has(e.source)) { 
      nodeSet.add(e.source); 
      nodes.add({ id: e.source, label: e.source, shape: 'box', color: '#97C2FC' }); 
    }
    if(!nodeSet.has(e.target)) { 
      nodeSet.add(e.target); 
      nodes.add({ id: e.target, label: e.target, shape: 'box', color: '#FFA807' }); 
    }
    edges.add({
      from: e.source,
      to: e.target,
      label: e.parameter,
      arrows: 'to',
      title: e.reason
    });
  });

  const container = document.getElementById('mynetwork');
  const data = { nodes, edges };
  const options = { 
    physics: { 
      enabled: true,
      barnesHut: { gravitationalConstant: -2000, centralGravity: 0.3, springLength: 150 }
    },
    edges: { smooth: true, font: { align: 'middle' } }
  };
  const network = new vis.Network(container, data, options);
</script>
</body>
</html>
`;

  await fs.writeFile("index.html", htmlContent);
  console.log("Visualized graph written to index.html");
}

main().catch(console.error);
