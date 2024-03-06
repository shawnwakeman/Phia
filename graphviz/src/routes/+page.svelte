<script>
    import BarChart from "../lib/BarChart.svelte";
    import Database from "../database.types"
    export let data;

    

    let nasd: nod
    function buildHierarchy(nodes: any[]): Node {
        const nodeMap = new Map(nodes.map(node => [node.id, { ...node, children: [] }]));

        let root: Node = { name: "root", children: [] }; // Root node

        nodes.forEach(node => {
            if (node.parent_id === null) {
            root.children.push(nodeMap.get(node.id));
            } else {
            const parentNode = nodeMap.get(node.parent_id);
            if (parentNode) {
                parentNode.children.push(nodeMap.get(node.id));
            }
            }
        });

        return root;
    }


</script>

<BarChart />
<p>{data}</p>
