<svelte:head>
  <title>{buildPageTitle('使い方')}</title>
  <meta
    name="description"
    content={`${SITE_NAME_JA}の使い方。区の選択、カテゴリ絞り込み、地図マーカーの見方、表示設定の使い方を確認できます。`}
  />
</svelte:head>

<script lang="ts">
  import { buildPageTitle, SITE_NAME_JA } from '$lib/site.js';

  const cautions = [
    '施設を利用する前に、必ず事前に電話で確認をしてください。',
    'このデータは最新のものではなく、間違っている可能性があります。',
    '回収できる品目や受付条件は区や施設ごとに異なります。',
  ];

  const guideSections = [
    {
      title: '区を選ぶ',
      body: [
        '画面上部の区選択から、表示したい区を選びます。選んだ区に対応する施設が地図に表示されます。',
        '複数の区を選ぶと、対象の施設をまとめて見比べられます。区を切り替えると、カテゴリの選択肢もその区の内容に合わせて変わります。',
      ],
    },
    {
      title: 'カテゴリで絞り込む',
      body: [
        'カテゴリバーでは、乾電池や小型家電など、探したい品目に合わせて表示対象を絞り込めます。',
        '選んだカテゴリに対応する施設だけが地図に残るため、持ち込み先を探しやすくなります。',
      ],
    },
    {
      title: '地図と施設情報を見る',
      body: [
        '地図上のマーカーは回収施設の場所です。検索結果から選ぶか、マーカーを押すと施設情報を確認できます。',
        '施設カードでは、名称、住所、対応カテゴリなどを確認できます。検索欄では施設名、住所、カテゴリ名をもとに候補を絞り込めます。',
      ],
    },
    {
      title: '表示設定を調整する',
      body: [
        '左上のメニューから開くサイドバーでは、マーカーデザインを切り替えられます。',
        '同心円、単色、グラデーションから見やすい表示を選べます。単色マーカーを選んだ場合は色も変更できます。',
      ],
    },
  ];

  const relatedPages = [
    {
      title: 'データについて',
      description: '掲載情報の見方や利用時の注意点を確認できます。',
      href: '/about-data',
    },
    {
      title: '更新情報',
      description: '追加した区や調整内容を確認できます。',
      href: '/updates',
    },
    {
      title: 'プライバシーポリシー',
      description: '位置情報や保存設定の取り扱いを確認できます。',
      href: '/privacy-policy',
    },
  ];
</script>

<div class="min-h-screen bg-[#f7f7f2] text-stone-800">
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
    <a
      href="/"
      class="inline-flex w-fit items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-50"
    >
      <span aria-hidden="true">‹</span>
      地図に戻る
    </a>

    <section class="border-b border-stone-300 pb-6">
      <p class="text-xs font-bold tracking-[0.18em] text-stone-500">GUIDE</p>
      <h1 class="mt-2 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">使い方</h1>
      <p class="mt-4 text-sm leading-8 text-stone-600 sm:text-base">
        {SITE_NAME_JA}は、区ごとに異なる回収拠点を地図上で探すためのアプリです。
        まず区を選び、必要に応じてカテゴリで絞り込むと、持ち込み先を見つけやすくなります。
      </p>
    </section>

    <section class="rounded-3xl border border-[#d8d3c7] bg-[#fffdf8] p-5 sm:p-6">
      <h2 class="text-xl font-black leading-tight text-stone-900 sm:text-2xl">ご利用前の確認</h2>
      <ul class="mt-4 space-y-3 text-base leading-8 text-stone-800 sm:mt-5 sm:text-lg">
        {#each cautions as caution}
          <li class="flex gap-3">
            <span class="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-stone-500"></span>
            <span>{caution}</span>
          </li>
        {/each}
      </ul>
    </section>

    <section class="space-y-8">
      {#each guideSections as section, index}
        <article class="border-b border-stone-200 pb-9 last:border-b-0 last:pb-0">
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8e2d7] text-xl font-black leading-none tracking-[-0.04em] text-stone-700 tabular-nums sm:h-10 sm:w-10 sm:text-[1.35rem]">
              {index + 1}
            </span>
            <div class="flex flex-1 items-center self-stretch border-b border-stone-300">
              <h2 class="text-xl font-black leading-tight text-stone-900 sm:text-2xl">{section.title}</h2>
            </div>
          </div>
          <div class="mt-4 space-y-4 text-sm leading-8 text-stone-700 sm:mt-5 sm:text-base">
            {#each section.body as paragraph}
              <p>{paragraph}</p>
            {/each}
          </div>
        </article>
      {/each}
    </section>

    <section class="border-t border-stone-300 pt-8">
      <h2 class="text-lg font-black text-stone-900 sm:text-xl">次に見る</h2>
      <div class="mt-4 overflow-hidden rounded-2xl border border-stone-300 bg-white">
        {#each relatedPages as page, index}
          <a
            href={page.href}
            class="grid grid-cols-[9rem_minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-stone-50 sm:grid-cols-[11rem_minmax(0,1fr)_auto]"
            class:border-b={index < relatedPages.length - 1}
            class:border-stone-200={index < relatedPages.length - 1}
          >
            <div class="min-w-0 border-r border-stone-200 pr-4">
              <div class="font-black leading-6 text-stone-900">
                {page.title}
              </div>
            </div>
            <div class="min-w-0 text-sm leading-7 text-stone-600 sm:text-base">
              {page.description}
            </div>
            <span class="shrink-0 text-stone-400">›</span>
          </a>
        {/each}
      </div>

      <a
        href="/"
        class="mt-5 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-50"
      >
        <span aria-hidden="true">‹</span>
        地図に戻る
      </a>
    </section>
  </div>
</div>
