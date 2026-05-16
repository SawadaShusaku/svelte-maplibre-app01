<script lang="ts">
  import type { AreaScope, PublicArea } from '$lib/data.js';
  
  let {
    selectedKeys = $bindable([]),
    allKeys = [],
    areaScope = $bindable('all'),
    areas = [],
    onSelectPrefecture = undefined,
  } = $props<{
    selectedKeys: string[];
    allKeys: string[];
    areaScope: AreaScope;
    areas: PublicArea[];
    onSelectPrefecture?: (prefecture: string) => void;
  }>();

  const PREFECTURES = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  const prefectureGroups = $derived.by(() => {
    const groups = new Map<string, PublicArea[]>();
    for (const area of areas) {
      const list = groups.get(area.prefecture) ?? [];
      list.push(area);
      groups.set(area.prefecture, list);
    }
    return [...groups.entries()].sort((a, b) => {
      const indexA = PREFECTURES.indexOf(a[0]);
      const indexB = PREFECTURES.indexOf(b[0]);
      const posA = indexA === -1 ? 999 : indexA;
      const posB = indexB === -1 ? 999 : indexB;
      return posA - posB;
    });
  });
  let open = $state(false);

  function togglePrefecture(prefecture: string, prefectureAreas: PublicArea[]) {
    areaScope = 'selected';
    const prefectureKeys = prefectureAreas.map(a => `${a.prefecture}/${a.id}`);
    const isCurrentlySelected = selectedKeys.length > 0 && selectedKeys[0].startsWith(`${prefecture}/`);

    if (isCurrentlySelected) {
      selectedKeys = [];
    } else {
      selectedKeys = prefectureKeys;
      if (onSelectPrefecture) onSelectPrefecture(prefecture);
    }
    open = false;
  }

  function showNationwide() {
    areaScope = 'all';
    selectedKeys = [];
    open = false;
  }

  let label = $derived(
    areaScope === 'all'
      ? "全国"
      : selectedKeys.length === 0
      ? "選択なし"
      : selectedKeys[0].split('/')[0]
  );
</script>

<div class="relative flex-shrink-0">
  <button
    onclick={() => (open = !open)}
    class="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-lg shadow-md px-4 py-3 text-sm font-bold text-gray-800 hover:bg-white transition-colors"
  >
    {label}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500 {open ? 'rotate-180' : ''} transition-transform">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>

  {#if open}
    <div class="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/50 p-3 z-50">
      <div class="max-h-80 overflow-y-auto">
        <button
          onclick={showNationwide}
          class="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors {areaScope === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}"
        >
          全国
        </button>
        <div class="h-px bg-gray-200 my-2"></div>
        {#each prefectureGroups as [prefecture, prefectureAreas]}
          {@const active = areaScope === 'selected' && selectedKeys.length > 0 && selectedKeys[0].startsWith(`${prefecture}/`)}
          <button
            onclick={() => togglePrefecture(prefecture, prefectureAreas)}
            class="w-full text-left px-3 py-2 rounded-md text-sm transition-colors {active ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-100'}"
          >
            {prefecture}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
