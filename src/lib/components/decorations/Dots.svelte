<script lang="ts">
  /**
   * ドットパターン（水玉）のUI装飾コンポーネント
   */
  export let size: number = 100;
  export let color: string = "#C1E1C1"; // パステルグリーン
  export let rows: number = 5;
  export let cols: number = 5;
  export let dotRadius: number = 6;
  export let spacing: number = 25;
  export let opacity: number = 0.8;
  export let className: string = "";

  const width = cols * spacing;
  const height = rows * spacing;
</script>

<svg 
  width={size} 
  height={size} 
  viewBox="0 0 {width} {height}" 
  xmlns="http://www.w3.org/2000/svg"
  class={className}
  style="opacity: {opacity};"
>
  <g fill={color}>
    {#each Array(rows) as _, y}
      {#each Array(cols) as _, x}
        <circle 
          cx={(x * spacing) + (spacing / 2)} 
          cy={(y * spacing) + (spacing / 2)} 
          r={dotRadius} 
        />
      {/each}
    {/each}
  </g>
</svg>
