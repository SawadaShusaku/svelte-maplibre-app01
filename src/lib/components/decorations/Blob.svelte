<script lang="ts">
  /**
   * 抽象的なグラデーションの形（Blob）を表現するUI装飾コンポーネント
   */
  export let size: number = 200;
  export let color1: string = "#FFB8D2"; // デフォルト：パステルピンク
  export let color2: string = "#C1C5FF"; // デフォルト：パステルパープル
  export let type: 1 | 2 | 3 = 1; // 形状のパターン
  export let opacity: number = 0.8;
  export let className: string = "";

  // Blobの形状パターン
  const paths = {
    1: "M 165.7 44.9 C 187 64.9 196.2 96.6 186.2 122.9 C 176.2 149.2 147 170.2 115.5 180.7 C 83.9 191.1 50.1 190.9 27.6 173.1 C 5.1 155.3 -6.2 119.8 3.5 89.2 C 13.2 58.7 43.8 33 73.1 17 C 102.5 0.9 144.3 24.8 165.7 44.9 Z",
    2: "M 164.8 55.4 C 181.8 74.3 194.2 97.4 186 116.8 C 177.7 136.1 148.9 151.7 122.8 165.1 C 96.7 178.6 73.4 190 49.6 182 C 25.8 174 1.5 146.6 0.1 118.8 C -1.4 91 22.1 62.7 44.3 43.1 C 66.5 23.5 87.5 12.6 109.8 12.9 C 132.2 13.2 147.8 36.5 164.8 55.4 Z",
    3: "M 158.3 54.1 C 171.1 71.9 176.2 98 166.4 118.9 C 156.5 139.8 131.7 155.5 106.3 162.3 C 80.8 169.1 54.6 167.1 35.8 153.2 C 17 139.3 5.5 113.6 4.6 88.6 C 3.6 63.6 13.1 39.4 30.6 23.8 C 48.2 8.3 73.8 1.4 97.1 4.5 C 120.4 7.6 145.4 36.4 158.3 54.1 Z"
  };

  const id = Math.random().toString(36).substr(2, 9);
</script>

<svg 
  width={size} 
  height={size} 
  viewBox="0 0 200 200" 
  xmlns="http://www.w3.org/2000/svg"
  class={className}
  style="opacity: {opacity};"
>
  <defs>
    <linearGradient id="blob-grad-{id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color={color1} />
      <stop offset="100%" stop-color={color2} />
    </linearGradient>
  </defs>
  <path d={paths[type]} fill="url(#blob-grad-{id})" />
</svg>
