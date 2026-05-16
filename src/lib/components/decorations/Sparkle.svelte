<script lang="ts">
  /**
   * キラキラ・スターバーストのUI装飾コンポーネント
   */
  export let size: number = 100;
  export let color: string = "#AEE1FF"; // パステルブルー
  export let variant: "star" | "asterisk" = "star";
  export let strokeWidth: number = 15;
  export let opacity: number = 0.9;
  export let className: string = "";
</script>

<svg 
  width={size} 
  height={size} 
  viewBox="0 0 200 200" 
  xmlns="http://www.w3.org/2000/svg"
  class={className}
  style="opacity: {opacity};"
>
  {#if variant === "star"}
    <!-- 4点のなめらかなキラキラ -->
    <path 
      d="M 100 10 C 100 60 140 100 190 100 C 140 100 100 140 100 190 C 100 140 60 100 10 100 C 60 100 100 60 100 10 Z" 
      fill={color} 
    />
  {:else}
    <!-- 細い線のアスタリスク型キラキラ -->
    <g stroke={color} stroke-width={strokeWidth} stroke-linecap="round">
      <path d="M 100 20 L 100 180" />
      <path d="M 20 100 L 180 100" />
      <path d="M 43 43 L 157 157" />
      <path d="M 43 157 L 157 43" />
    </g>
  {/if}
</svg>
