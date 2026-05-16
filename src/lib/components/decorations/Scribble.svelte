<script lang="ts">
  /**
   * ウェーブ（波線）やジグザグなどのライン装飾コンポーネント
   */
  export let size: number = 150;
  export let color: string = "#FFD180"; // パステルオレンジ
  export let strokeWidth: number = 8;
  export let variant: "wave" | "squiggle" | "line" = "wave";
  export let opacity: number = 0.9;
  export let className: string = "";
</script>

<svg 
  width={size} 
  height={size / 2} 
  viewBox="0 0 200 100" 
  xmlns="http://www.w3.org/2000/svg"
  class={className}
  style="opacity: {opacity};"
>
  <path 
    fill="none" 
    stroke={color} 
    stroke-width={strokeWidth} 
    stroke-linecap="round"
    stroke-linejoin="round"
    d={
      variant === 'wave' 
        ? "M 10 50 Q 30 20 50 50 T 90 50 T 130 50 T 170 50 T 210 50" // なめらかな波線
      : variant === 'squiggle'
        ? "M 10 50 C 30 10, 50 90, 70 50 C 90 10, 110 90, 130 50 C 150 10, 170 90, 190 50" // ループに近い波線
      : "M 20 50 L 180 50" // ただの直線
    }
  />
</svg>
