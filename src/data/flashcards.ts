export type FlashcardType = 'vocab' | 'kanji';

export interface KanjiVocabItem {
  kanji: string;
  kana: string;
  hanViet: string;
  meaning: string;
}

export interface Flashcard {
  id: number;
  type?: FlashcardType; // 'vocab' (default) or 'kanji'
  kanji: string;
  kana: string;
  viet: string;
  vietnamese?: string;
  hanViet: string;
  partOfSpeech?: string;

  // Specific to kanji card:
  onyomi?: string;
  kunyomi?: string;
  kanjiMeaning?: string;
  vocabList?: KanjiVocabItem[];

  // Examples
  example: string;
  exampleRuby?: string;
  exampleKana?: string;
  exampleViet: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: string;
  cards: Flashcard[];
}

// 12 New Kanji Cards populated into Lesson 1
export const LESSON_1_KANJI_CARDS: Flashcard[] = [
  {
    id: 101,
    type: 'kanji',
    kanji: "回",
    kana: "カイ, エ / まわ.る, まわ.す",
    viet: "xoay, quay lại, lần",
    hanViet: "HỒI",
    onyomi: "カイ, エ",
    kunyomi: "まわ.る, まわ.す",
    partOfSpeech: "Hán tự",
    vocabList: [
      { kanji: "回す", kana: "まわす", hanViet: "HỒI", meaning: "xoay, vặn, chuyển" },
      { kanji: "回る", kana: "まわる", hanViet: "HỒI", meaning: "xoay quanh, đi vòng quanh, quay" },
      { kanji: "回収", kana: "かいしゅう", hanViet: "HỒI THU", meaning: "thu hồi, thu gom" },
      { kanji: "次回", kana: "じかい", hanViet: "THỨ HỒI", meaning: "lần sau, lần tiếp theo" },
      { kanji: "遠回り", kana: "とおまわり", hanViet: "VIỄN HỒI", meaning: "đi đường vòng, vòng vèo" }
    ],
    example: "次回は気をつけます。",
    exampleRuby: "次回[じかい]は気[き]をつけます。",
    exampleKana: "じかいはきをつけます。",
    exampleViet: "Lần sau tôi sẽ chú ý hơn."
  },
  {
    id: 102,
    type: 'kanji',
    kanji: "因",
    kana: "イン / よ.る",
    viet: "nguyên nhân, lý do",
    hanViet: "NHÂN",
    onyomi: "イン",
    kunyomi: "よ.る",
    partOfSpeech: "Hán tự",
    vocabList: [
      { kanji: "原因", kana: "げんいん", hanViet: "NGUYÊN NHÂN", meaning: "nguyên nhân, lý do" }
    ],
    example: "失敗の原因を調べる。",
    exampleRuby: "失敗[しっぱい]の原因[げんいん]を調[しら]べる。",
    exampleKana: "しっぱいのげんいんをしらべる。",
    exampleViet: "Tìm hiểu nguyên nhân thất bại."
  },
  {
    id: 103,
    type: 'kanji',
    kanji: "困",
    kana: "コン / こま.る",
    viet: "khó khăn, khốn khó",
    hanViet: "KHỐN",
    onyomi: "コン",
    kunyomi: "こま.る",
    partOfSpeech: "Hán tự",
    vocabList: [
      { kanji: "困る", kana: "こまる", hanViet: "KHỐN", meaning: "gặp khó khăn, rắc rối, bối rối" },
      { kanji: "困難", kana: "こんなん", hanViet: "KHỐN NAN", meaning: "khó khăn, gian nan" }
    ],
    example: "お金がなくて困っています。",
    exampleRuby: "お金[かね]がなくて困[こま]っています。",
    exampleKana: "おかねがなくてこまっています。",
    exampleViet: "Tôi đang gặp khó khăn vì không có tiền."
  },
  {
    id: 104,
    type: 'kanji',
    kanji: "恥",
    kana: "チ / は.ずかしい, は.じる",
    viet: "xấu hổ",
    hanViet: "SỈ",
    onyomi: "チ",
    kunyomi: "は.ずかしい, は.じる, はじ, は.じらう",
    partOfSpeech: "Hán tự",
    vocabList: [
      { kanji: "恥ずかしい", kana: "はずかしい", hanViet: "SỈ", meaning: "xấu hổ" }
    ],
    example: "みんなの前で転んで恥ずかしかった。",
    exampleRuby: "みんなの前[まえ]で転[ころ]んで恥[は]ずかしかった。",
    exampleKana: "みんなのまえでころんではずかしかった。",
    exampleViet: "Bị ngã trước mặt mọi người thật là xấu hổ."
  },
  {
    id: 105,
    type: 'kanji',
    kanji: "取",
    kana: "シュ / と.る",
    viet: "lấy, nắm, nhận",
    hanViet: "THỦ",
    onyomi: "シュ",
    kunyomi: "と.る",
    partOfSpeech: "Hán tự",
    vocabList: [
      { kanji: "取る", kana: "とる", hanViet: "THỦ", meaning: "lấy, giữ, đạt được, giành được; loại bỏ" },
      { kanji: "やり取り", kana: "やりとり", hanViet: "THỦ", meaning: "trao đổi qua lại, đối đáp" },
      { kanji: "受け取る", kana: "うけとる", hanViet: "THỤ THỦ", meaning: "nhận, tiếp nhận, hiểu được" }
    ],
    example: "メールのやり取りを続けます。",
    exampleRuby: "メールのやり取[と]りを続[つづ]けます。",
    exampleKana: "メールのやりとりをつづけます。",
    exampleViet: "Tiếp tục trao đổi qua lại bằng email."
  },
  {
    id: 106,
    type: 'kanji',
    kanji: "最",
    kana: "サイ / もっと.も",
    viet: "nhất, cực kỳ",
    hanViet: "TỐI",
    onyomi: "サイ",
    kunyomi: "もっと.も",
    partOfSpeech: "Hán tự",
    vocabList: [
      { kanji: "最も", kana: "もっとも", hanViet: "TỐI", meaning: "nhất, vô cùng, cực kỳ" },
      { kanji: "最高", kana: "さいこう", hanViet: "TỐI CAO", meaning: "cao nhất, nhất; tuyệt vời, tuyệt nhất" },
      { kanji: "最初", kana: "さいしょ", hanViet: "TỐI SƠ", meaning: "đầu tiên, ban đầu, lúc đầu" }
    ],
    example: "最高の思い出になりました。",
    exampleRuby: "最高[さいこう]の思[おも]い出[で]になりました。",
    exampleKana: "さいこうのおもいでになりました。",
    exampleViet: "Đã trở thành một kỷ niệm tuyệt vời nhất."
  },
  {
    id: 107,
    type: 'kanji',
    kanji: "亡",
    kana: "ボウ, モウ / な.い",
    viet: "chết, mất",
    hanViet: "VONG",
    onyomi: "ボウ, モウ",
    kunyomi: "な.い",
    partOfSpeech: "Hán tự",
    vocabList: [
      { kanji: "亡くす", kana: "なくす", hanViet: "VONG", meaning: "mất đi, đánh mất" },
      { kanji: "亡くなる", kana: "なくなる", hanViet: "VONG", meaning: "qua đời, mất" },
      { kanji: "死亡", kana: "しぼう", hanViet: "TỬ VONG", meaning: "tử vong, qua đời" }
    ],
    example: "祖父が去年亡くなりました。",
    exampleRuby: "祖父[そふ]が去年[きょねん]亡[な]くなりました。",
    exampleKana: "そふがきょねんなくなりました。",
    exampleViet: "Ông tôi đã qua đời vào năm ngoái."
  },
  {
    id: 108,
    type: 'kanji',
    kanji: "忘",
    kana: "ボウ / わす.れる",
    viet: "quên",
    hanViet: "VONG",
    onyomi: "ボウ",
    kunyomi: "わす.れる",
    partOfSpeech: "Hán tự",
    vocabList: [
      { kanji: "忘れる", kana: "わすれる", hanViet: "VONG", meaning: "quên, bỏ quên, không nhớ" },
      { kanji: "忘れ物", kana: "わすれもの", hanViet: "VONG VẬT", meaning: "đồ bị bỏ quên, đồ thất lạc" },
      { kanji: "忘年会", kana: "ぼうねんかい", hanViet: "VONG NIÊN HỘI", meaning: "tiệc tất niên, tiệc cuối năm" }
    ],
    example: "傘を電車の中に忘れました。",
    exampleRuby: "傘[かさ]を電車[でんしゃ]の中[なか]に忘[わす]れました。",
    exampleKana: "かさをでんしゃのなかにわすれました。",
    exampleViet: "Tôi đã để quên chiếc ô trong tàu điện."
  },
  {
    id: 109,
    type: 'kanji',
    kanji: "望",
    kana: "ボウ, モウ / のぞ.む",
    viet: "mong muốn, hy vọng",
    hanViet: "VỌNG",
    onyomi: "ボウ, モウ",
    kunyomi: "のぞ.む",
    partOfSpeech: "Hán tự",
    vocabList: [
      { kanji: "望む", kana: "のぞむ", hanViet: "VỌNG", meaning: "mong muốn, kỳ vọng, hy vọng" },
      { kanji: "希望", kana: "きぼう", hanViet: "HY VỌNG", meaning: "hy vọng, mong muốn, nguyện vọng" }
    ],
    example: "平和な世界を望んでいます。",
    exampleRuby: "平和[へいわ]な世界[せかい]を望[のぞ]んでいます。",
    exampleKana: "へいわなせかいをのぞんでいます。",
    exampleViet: "Tôi hy vọng và mong muốn một thế giới hòa bình."
  },
  {
    id: 110,
    type: 'kanji',
    kanji: "忙",
    kana: "ボウ / いそが.しい",
    viet: "bận rộn",
    hanViet: "MANG",
    onyomi: "ボウ",
    kunyomi: "いそが.しい",
    partOfSpeech: "Hán tự",
    vocabList: [
      { kanji: "忙しい", kana: "いそがしい", hanViet: "MANG", meaning: "bận rộn" }
    ],
    example: "今週は仕事がとても忙しいです。",
    exampleRuby: "今週[こんしゅう]は仕事[しごと]がとても忙[いそが]しいです。",
    exampleKana: "こんしゅうはしごとがとてもいそがしいです。",
    exampleViet: "Tuần này công việc vô cùng bận rộn."
  },
  {
    id: 111,
    type: 'kanji',
    kanji: "慣",
    kana: "カン / な.れる, な.らす",
    viet: "quen thuộc, tập quán",
    hanViet: "QUÁN",
    onyomi: "カン",
    kunyomi: "な.れる, な.らす",
    partOfSpeech: "Hán tự",
    vocabList: [
      { kanji: "慣れる", kana: "なれる", hanViet: "QUÁN", meaning: "thích nghi với, quen với" },
      { kanji: "習慣", kana: "しゅうかん", hanViet: "TẬP QUÁN", meaning: "thói quen, tập quán" }
    ],
    example: "日本での生活にだんだん慣れてきました。",
    exampleRuby: "日本[にほん]での生活[せいかつ]にだんだん慣[な]れてきました。",
    exampleKana: "にほんでのせいかつにだんだんなれてきました。",
    exampleViet: "Tôi đã dần dần quen với cuộc sống ở Nhật Bản."
  },
  {
    id: 112,
    type: 'kanji',
    kanji: "情",
    kana: "ジョウ / なさ.け",
    viet: "cảm xúc, tình cảm",
    hanViet: "TÌNH",
    onyomi: "ジョウ",
    kunyomi: "なさ.け",
    partOfSpeech: "Hán tự",
    vocabList: [
      { kanji: "感情", kana: "かんじょう", hanViet: "CẢM TÌNH", meaning: "cảm xúc, tình cảm" },
      { kanji: "事情", kana: "じじょう", hanViet: "SỰ TÌNH", meaning: "sự tình, hoàn cảnh, tình hình, lý do" },
      { kanji: "情報", kana: "じょうほう", hanViet: "TÌNH BÁO", meaning: "thông tin, tin tức" },
      { kanji: "表情", kana: "ひょうじょう", hanViet: "BIỂU TÌNH", meaning: "biểu cảm, nét mặt, vẻ mặt" },
      { kanji: "友情", kana: "ゆうじょう", hanViet: "HỮU TÌNH", meaning: "tình bạn, tình hữu nghị" },
      { kanji: "感情的", kana: "かんじょうてき", hanViet: "CẢM TÌNH ĐÍCH", meaning: "mang tính cảm xúc, dễ xúc động" }
    ],
    example: "インターネットで必要な情報を集めます。",
    exampleRuby: "インターネットで必要[ひつよう]な情報[じょうほう]を集[あつ]めます。",
    exampleKana: "インターネットでひつようなじょうほうをあつめます。",
    exampleViet: "Thu thập những thông tin cần thiết trên Internet."
  }
];

// Related Vocab cards added for Lesson 1
export const LESSON_1_RELATED_VOCAB_CARDS: Flashcard[] = [
  {
    id: 120,
    type: 'vocab',
    kanji: "回す",
    kana: "まわす",
    viet: "xoay, vặn, chuyển",
    hanViet: "HỒI",
    partOfSpeech: "Động từ",
    example: "つまみを右に回してください。",
    exampleRuby: "つまみを右[みぎ]に回[まわ]してください。",
    exampleKana: "つまみをみぎにまわしてください。",
    exampleViet: "Hãy xoay núm vặn sang bên phải."
  },
  {
    id: 121,
    type: 'vocab',
    kanji: "回る",
    kana: "まわる",
    viet: "xoay quanh, đi vòng quanh, quay",
    hanViet: "HỒI",
    partOfSpeech: "Động từ",
    example: "ファンが静かに回っています。",
    exampleRuby: "ファンが静[しず]かに回[まわ]っています。",
    exampleKana: "ファンがしずかにまわっています。",
    exampleViet: "Cánh quạt đang quay một cách êm ái."
  },
  {
    id: 122,
    type: 'vocab',
    kanji: "回収",
    kana: "かいしゅう",
    viet: "thu hồi, thu gom",
    hanViet: "HỒI THU",
    partOfSpeech: "Danh từ",
    example: "燃えるゴミの回収は火曜日です。",
    exampleRuby: "燃[も]えるゴミの回収[かいしゅう]は火曜日[かようび]です。",
    exampleKana: "もえるゴミのかいしゅうはかようびです。",
    exampleViet: "Việc thu gom rác cháy được là vào thứ Ba."
  },
  {
    id: 123,
    type: 'vocab',
    kanji: "遠回り",
    kana: "とおまわり",
    viet: "đi đường vòng, vòng vèo",
    hanViet: "VIỄN HỒI",
    partOfSpeech: "Danh từ",
    example: "工事中のため、遠回りをして駅へ行った。",
    exampleRuby: "工事中[こうじちゅう]のため、遠回[とおまわ]りをして駅[えき]へ行[い]った。",
    exampleKana: "こうじちゅうのため、とおまわりをしてえきへいった。",
    exampleViet: "Vì đang sửa đường nên tôi đã phải đi đường vòng đến nhà ga."
  },
  {
    id: 124,
    type: 'vocab',
    kanji: "困る",
    kana: "こまる",
    viet: "gặp khó khăn, rắc rối, bối rối",
    hanViet: "KHỐN",
    partOfSpeech: "Động từ",
    example: "道に迷って困ってしまった。",
    exampleRuby: "道[みち]に迷[まよ]って困[こま]ってしまった。",
    exampleKana: "みちにまよってこまってしまった。",
    exampleViet: "Tôi bị lạc đường và gặp rất nhiều bối rối."
  },
  {
    id: 125,
    type: 'vocab',
    kanji: "困難",
    kana: "こんなん",
    viet: "khó khăn, gian nan",
    hanViet: "KHỐN NAN",
    partOfSpeech: "Tính từ đuôi な / Danh từ",
    example: "困難な状況を乗り越える。",
    exampleRuby: "困難[こんなん]な状況[じょうきょう]を乗[の]り越[こ]える。",
    exampleKana: "こんなんなじょうきょうをのりこえる。",
    exampleViet: "Vượt qua tình huống khó khăn, gian nan."
  },
  {
    id: 126,
    type: 'vocab',
    kanji: "恥ずかしい",
    kana: "はずかしい",
    viet: "xấu hổ, ngượng ngùng",
    hanViet: "SỈ",
    partOfSpeech: "Tính từ đuôi い",
    example: "人前で話すのはとても恥ずかしい。",
    exampleRuby: "人前[ひとまえ]で話[はな]すのはとても恥[は]ずかしい。",
    exampleKana: "ひとまえではなすのはとてもはずかしい。",
    exampleViet: "Nói chuyện trước đám đông rất là xấu hổ."
  },
  {
    id: 127,
    type: 'vocab',
    kanji: "取る",
    kana: "とる",
    viet: "lấy, nắm, nhận, giành được",
    hanViet: "THỦ",
    partOfSpeech: "Động từ",
    example: "塩を取っていただけますか。",
    exampleRuby: "塩[しお]を取[と]っていただけますか。",
    exampleKana: "しおをとっていただけますか。",
    exampleViet: "Bạn có thể lấy giúp tôi lọ muối được không?"
  },
  {
    id: 128,
    type: 'vocab',
    kanji: "やり取り",
    kana: "やりとり",
    viet: "trao đổi qua lại, đối đáp",
    hanViet: "THỦ",
    partOfSpeech: "Danh từ",
    example: "彼とはメールで何度もやり取りをした。",
    exampleRuby: "彼[かれ]とはメールで何度[なんど]もやり取[と]りをした。",
    exampleKana: "かれとはメールでなんどもやりとりをした。",
    exampleViet: "Tôi đã trao đổi qua email với anh ấy rất nhiều lần."
  },
  {
    id: 129,
    type: 'vocab',
    kanji: "受け取る",
    kana: "うけとる",
    viet: "nhận, tiếp nhận, hiểu được",
    hanViet: "THỤ THỦ",
    partOfSpeech: "Động từ",
    example: "宅配便の荷物を受け取りました。",
    exampleRuby: "宅配便[たくはいびん]の荷物[にもつ]を受[う]け取[と]りました。",
    exampleKana: "たくはいびんのにもつをうけとりました。",
    exampleViet: "Tôi đã nhận được bưu kiện giao hàng tận nhà."
  },
  {
    id: 130,
    type: 'vocab',
    kanji: "最も",
    kana: "もっとも",
    viet: "nhất, vô cùng, cực kỳ",
    hanViet: "TỐI",
    partOfSpeech: "Phó từ",
    example: "富士山は日本で最も高い山です。",
    exampleRuby: "富士山[ふじさん]は日本[にほん]で最[もっと]も高[たか]い山[やま]です。",
    exampleKana: "ふじさんはにほんでもっともたかいやまです。",
    exampleViet: "Núi Phú Sĩ là ngọn núi cao nhất Nhật Bản."
  },
  {
    id: 131,
    type: 'vocab',
    kanji: "最高",
    kana: "さいこう",
    viet: "cao nhất, nhất; tuyệt vời, tuyệt nhất",
    hanViet: "TỐI CAO",
    partOfSpeech: "Tính từ đuôi な / Danh từ",
    example: "今日の天気は本当に最高ですね。",
    exampleRuby: "今日[きょう]の天気[てんき]は本当[ほんとう]に最高[さいこう]ですね。",
    exampleKana: "きょうのてんきはほんとうにさいこうですね。",
    exampleViet: "Thời tiết hôm nay thật sự tuyệt vời nhất."
  },
  {
    id: 132,
    type: 'vocab',
    kanji: "亡くす",
    kana: "なくす",
    viet: "mất đi, đánh mất người thân",
    hanViet: "VONG",
    partOfSpeech: "Động từ",
    example: "幼い頃に両親を亡くしました。",
    exampleRuby: "幼[おさな]い頃[ころ]に両親[りょうしん]を亡[な]くしました。",
    exampleKana: "おさないころにりょうしんをなくしました。",
    exampleViet: "Tôi đã mất cha mẹ từ khi còn thơ ấu."
  },
  {
    id: 133,
    type: 'vocab',
    kanji: "亡くなる",
    kana: "なくなる",
    viet: "qua đời, mất",
    hanViet: "VONG",
    partOfSpeech: "Động từ",
    example: "有名な作家が亡くなりました。",
    exampleRuby: "有名[ゆうめい]な作家[さっか]が亡[な]くなりました。",
    exampleKana: "ゆうめいなさっかがなくなりました。",
    exampleViet: "Một nhà văn nổi tiếng đã qua đời."
  },
  {
    id: 134,
    type: 'vocab',
    kanji: "死亡",
    kana: "しぼう",
    viet: "tử vong, qua đời",
    hanViet: "TỬ VONG",
    partOfSpeech: "Danh từ",
    example: "交通事故による死亡者が減少した。",
    exampleRuby: "交通事故[こうつうじこ]による死亡者[しぼうしゃ]が減少[げんしょう]した。",
    exampleKana: "こうつうじこによるしぼうしゃがげんしょうした。",
    exampleViet: "Số người tử vong do tai nạn giao thông đã giảm."
  },
  {
    id: 135,
    type: 'vocab',
    kanji: "忘れる",
    kana: "わすれる",
    viet: "quên, bỏ quên, không nhớ",
    hanViet: "VONG",
    partOfSpeech: "Động từ",
    example: "宿題をするのを忘れてしまいました。",
    exampleRuby: "宿題[しゅくだい]をするのを忘[わす]れてしまいました。",
    exampleKana: "しゅくだいをするのをわすれてしまいました。",
    exampleViet: "Tôi đã lỡ quên làm bài tập về nhà mất rồi."
  },
  {
    id: 136,
    type: 'vocab',
    kanji: "忘れ物",
    kana: "わすれもの",
    viet: "đồ bị bỏ quên, đồ thất lạc",
    hanViet: "VONG VẬT",
    partOfSpeech: "Danh từ",
    example: "教室に忘れ物がないか確認してください。",
    exampleRuby: "教室[きょうしつ]に忘[わす]れ物[もの]がないか確認[かくにん]してください。",
    exampleKana: "きょうしつにわすれものがないかかくにんしてください。",
    exampleViet: "Hãy kiểm tra xem có đồ bỏ quên trong lớp học không."
  },
  {
    id: 137,
    type: 'vocab',
    kanji: "忘年会",
    kana: "ぼうねんかい",
    viet: "tiệc tất niên, tiệc cuối năm",
    hanViet: "VONG NIÊN HỘI",
    partOfSpeech: "Danh từ",
    example: "年末に会社の忘年会があります。",
    exampleRuby: "年末[ねんまつ]に会社[かいしゃ]の忘年会[ぼうねんかい]があります。",
    exampleKana: "ねんまつにかいしゃのぼうねんかいがあります。",
    exampleViet: "Vào dịp cuối năm sẽ có tiệc tất niên của công ty."
  },
  {
    id: 138,
    type: 'vocab',
    kanji: "望む",
    kana: "のぞむ",
    viet: "mong muốn, kỳ vọng, hy vọng",
    hanViet: "VỌNG",
    partOfSpeech: "Động từ",
    example: "誰もが幸せな人生を望んでいる。",
    exampleRuby: "誰[だれ]もが幸[しあわ]せな人生[じんせい]を望[のぞ]んでいる。",
    exampleKana: "だれもがしあわせなじんせいをのぞんでいる。",
    exampleViet: "Ai cũng mong muốn một cuộc đời hạnh phúc."
  },
  {
    id: 139,
    type: 'vocab',
    kanji: "希望",
    kana: "きぼう",
    viet: "hy vọng, mong muốn, nguyện vọng",
    hanViet: "HY VỌNG",
    partOfSpeech: "Danh từ",
    example: "未来への希望を失わないでください。",
    exampleRuby: "未来[みらい]への希望[きぼう]を失[うしな]わないでください。",
    exampleKana: "みらいへのきぼうをうしなわないでください。",
    exampleViet: "Xin đừng đánh mất niềm hy vọng vào tương lai."
  },
  {
    id: 140,
    type: 'vocab',
    kanji: "忙しい",
    kana: "いそがしい",
    viet: "bận rộn",
    hanViet: "MANG",
    partOfSpeech: "Tính từ đuôi い",
    example: "最近は毎日忙しくて目が回りそうだ。",
    exampleRuby: "最近[さいきん]は毎日[まいにち]忙[いそが]しくて目[め]が回[まわ]りそうだ。",
    exampleKana: "さいきんはまいにちいそがしくてめがまわりそうだ。",
    exampleViet: "Dạo này ngày nào cũng bận rộn tới mức chóng mặt."
  },
  {
    id: 141,
    type: 'vocab',
    kanji: "慣れる",
    kana: "なれる",
    viet: "thích nghi với, quen với",
    hanViet: "QUÁN",
    partOfSpeech: "Động từ",
    example: "新しい環境にもすぐに慣れました。",
    exampleRuby: "新[あたら]しい環境[かんきょう]にもすぐに慣[な]れました。",
    exampleKana: "あたらしいかんきょうにもすぐになれました。",
    exampleViet: "Tôi đã nhanh chóng làm quen với môi trường mới."
  },
  {
    id: 142,
    type: 'vocab',
    kanji: "感情的",
    kana: "かんじょうてき",
    viet: "mang tính cảm xúc, dễ xúc động",
    hanViet: "CẢM TÌNH ĐÍCH",
    partOfSpeech: "Tính từ đuôi な",
    example: "話し合いの時は感情的にならないようにする。",
    exampleRuby: "話[はな]し合[あ]いの時[とき]は感情的[かんじょうてき]にならないようにする。",
    exampleKana: "はなしあいのときはかんじょうてきにならないようにする。",
    exampleViet: "Khi bàn bạc hãy cố gắng không để bị xúc động hay thiên về cảm xúc."
  }
];

// Existing 30 base vocabulary cards
export const LESSON_1_BASE_VOCAB_CARDS: Flashcard[] = [
  {
    id: 1,
    type: 'vocab',
    kanji: "次回",
    kana: "じかい",
    viet: "lần sau, lần tiếp theo",
    hanViet: "THỨ HỒI",
    partOfSpeech: "Danh từ",
    example: "次回は気をつけます。",
    exampleRuby: "次回[じかい]は気[き]をつけます。",
    exampleKana: "じかいはきをつけます。",
    exampleViet: "Lần sau tôi sẽ chú ý hơn."
  },
  {
    id: 2,
    type: 'vocab',
    kanji: "原因",
    kana: "げんいん",
    viet: "nguyên nhân, lý do",
    hanViet: "NGUYÊN NHÂN",
    partOfSpeech: "Danh từ",
    example: "失敗の原因を調べる。",
    exampleRuby: "失敗[しっぱい]の原因[げんいん]を調[しら]べる。",
    exampleKana: "しっぱいのげんいんをしらべる。",
    exampleViet: "Tìm hiểu nguyên nhân thất bại."
  },
  {
    id: 3,
    type: 'vocab',
    kanji: "習慣",
    kana: "しゅうかん",
    viet: "thói quen, tập quán",
    hanViet: "TẬP QUÁN",
    partOfSpeech: "Danh từ",
    example: "この仕事を始めてから、早起きの習慣が身に付いた。",
    exampleRuby: "この仕事[しごと]を始[はじ]めてから、早起[はやお]きの習慣[しゅうかん]が身[み]に付[つ]いた。",
    exampleKana: "このしごとをはじめてから、はやおきのしゅうかんがみについた。",
    exampleViet: "Kể từ khi bắt đầu công việc này, tôi đã hình thành thói quen dậy sớm."
  },
  {
    id: 4,
    type: 'vocab',
    kanji: "最後",
    kana: "さいご",
    viet: "cuối cùng, lần cuối",
    hanViet: "TỐI HẬU",
    partOfSpeech: "Danh từ",
    example: "アルバイト最後の日に、パーティーを開いてもらった。",
    exampleRuby: "アルバイト最後[さいご]の日[ひ]に、パーティーを開[ひら]いてもらった。",
    exampleKana: "アルバイトさいごのひに、パーティーをひらいてもらった。",
    exampleViet: "Tôi đã được mọi người tổ chức cho một buổi party vào ngày đi làm thêm cuối cùng."
  },
  {
    id: 5,
    type: 'vocab',
    kanji: "最終",
    kana: "さいしゅう",
    viet: "sau cùng, cuối cùng (giai đoạn)",
    hanViet: "TỐI CHUNG",
    partOfSpeech: "Danh từ",
    example: "最終電車は11時58分です。",
    exampleRuby: "最終電車[さいしゅうでんしゃ]は11時[じ]58分[ふん]です。",
    exampleKana: "さいしゅうでんしゃは11じ58ふんです。",
    exampleViet: "Chuyến tàu cuối xuất phát lúc 11:58."
  },
  {
    id: 6,
    type: 'vocab',
    kanji: "最初",
    kana: "さいしょ",
    viet: "đầu tiên, ban đầu, lúc đầu",
    hanViet: "TỐI SƠ",
    partOfSpeech: "Danh từ",
    example: "最初は漢字が全然読めなかったけど、今は読める。",
    exampleRuby: "最初[さいしょ]は漢字[かんじ]が全然[ぜんぜん]読[よ]めなかったけど、今[いま]は読[よ]める。",
    exampleKana: "さいしょはかんじがぜんぜんよめなかったけど、いまはよめる。",
    exampleViet: "Ban đầu tôi hoàn toàn không đọc được chữ Hán, nhưng bây giờ tôi đã đọc được rồi."
  },
  {
    id: 7,
    type: 'vocab',
    kanji: "最新",
    kana: "さいしん",
    viet: "mới nhất, hiện đại nhất",
    hanViet: "TỐI TÂN",
    partOfSpeech: "Danh từ",
    example: "このデータは、今年最新のデータです。",
    exampleRuby: "このデータは、今年[ことし]最新[さいしん]のデータです。",
    exampleKana: "このデータは、ことしさいしんのデータです。",
    exampleViet: "Dữ liệu này là dữ liệu mới nhất của năm nay."
  },
  {
    id: 8,
    type: 'vocab',
    kanji: "最多",
    kana: "さいた",
    viet: "nhiều nhất (số lượng)",
    hanViet: "TỐI ĐA",
    partOfSpeech: "Danh từ",
    example: "今年は台風の数がこの5年で最多だった。",
    exampleRuby: "今年[ことし]は台風[たいふう]の数[かず]がこの5年[ねん]で最多[さいた]だった。",
    exampleKana: "ことしはたいふうのかずがこの5ねんでさいただた。",
    exampleViet: "Năm nay là năm có số lượng bão nhiều nhất trong vòng 5 năm gần đây."
  },
  {
    id: 9,
    type: 'vocab',
    kanji: "最大",
    kana: "さいだい",
    viet: "lớn nhất, cực đại, tối đa",
    hanViet: "TỐI ĐA",
    partOfSpeech: "Danh từ",
    example: "この会場は最大で1万人入ります。",
    exampleRuby: "この会場[かいじょう]は最大[さいだい]で1万人[まんにん]入[はい]ります。",
    exampleKana: "このかいじょうはさいだいで1まんにんはいります。",
    exampleViet: "Hội trường này có thể chứa tối đa 10.000 người."
  },
  {
    id: 10,
    type: 'vocab',
    kanji: "最中",
    kana: "さいちゅう",
    viet: "đang trong lúc, giữa chừng",
    hanViet: "TỐI TRUNG",
    partOfSpeech: "Danh từ",
    example: "試合の最中に地震が起きた。",
    exampleRuby: "試合[しあい]の最中[さいちゅう]に地震[じしん]が起[お]きた。",
    exampleKana: "しあいのさいちゅうにじしんがおきた。",
    exampleViet: "Động đất đã xảy ra ngay trong lúc trận đấu đang diễn ra."
  },
  {
    id: 11,
    type: 'vocab',
    kanji: "感情",
    kana: "かんじょう",
    viet: "cảm xúc, tình cảm",
    hanViet: "CẢM TÌNH",
    partOfSpeech: "Danh từ",
    example: "私は感情が表に出やすい。",
    exampleRuby: "私[わたし]は感情[かんじょう]が表[おもて]に出[で]やすい。",
    exampleKana: "わたしはかんじょうがおもてにでやすい。",
    exampleViet: "Tôi dễ để lộ cảm xúc ra bên ngoài."
  },
  {
    id: 12,
    type: 'vocab',
    kanji: "事情",
    kana: "じじょう",
    viet: "sự tình, hoàn cảnh, lý do",
    hanViet: "SỰ TÌNH",
    partOfSpeech: "Danh từ",
    example: "彼は中国に住んでいたので、中国の事情に詳しい。",
    exampleRuby: "彼[かれ]は中国[ちゅうごく]に住[す]んでいたので、中国[ちゅうごく]の事情[じじょう]に詳[くわ]しい。",
    exampleKana: "かれはちゅうごくにすんでいたので、ちゅうごくのじじょうにくわしい。",
    exampleViet: "Vì anh ấy từng sống ở Trung Quốc nên rất am hiểu tình hình Trung Quốc."
  },
  {
    id: 13,
    type: 'vocab',
    kanji: "情報",
    kana: "じょうほう",
    viet: "thông tin",
    hanViet: "TÌNH BÁO",
    partOfSpeech: "Danh từ",
    example: "事件の情報を集めています。",
    exampleRuby: "事件[じけん]の情報[じょうほう]を集[あつ]めています。",
    exampleKana: "じけんのじょうほうをあつめています。",
    exampleViet: "Đang thu thập thông tin về vụ án."
  },
  {
    id: 14,
    type: 'vocab',
    kanji: "表情",
    kana: "ひょうじょう",
    viet: "biểu cảm, nét mặt",
    hanViet: "BIỂU TÌNH",
    partOfSpeech: "Danh từ",
    example: "彼女の表情が急に変わった。",
    exampleRuby: "彼女[かのじょ]の表情[ひょうじょう]が急[きゅう]に変[か]わった。",
    exampleKana: "かのじょのひょうじょうがきゅうにかわった。",
    exampleViet: "Nét mặt của cô ấy đột ngột thay đổi."
  },
  {
    id: 15,
    type: 'vocab',
    kanji: "友情",
    kana: "ゆうじょう",
    viet: "tình bạn",
    hanViet: "HỮU TÌNH",
    partOfSpeech: "Danh từ",
    example: "彼とは大切な友情で結ばれている。",
    exampleRuby: "彼[かれ]とは大切[たいせつ]な友情[ゆうじょう]で結[むす]ばれている。",
    exampleKana: "かれとはたいせつなゆうじょうでむすばれている。",
    exampleViet: "Tôi và anh ấy được gắn kết bởi tình bạn quý giá."
  },
  {
    id: 16,
    type: 'vocab',
    kanji: "調子",
    kana: "ちょうし",
    viet: "tình trạng, trạng thái",
    hanViet: "ĐIỀU TỬ",
    partOfSpeech: "Danh từ",
    example: "最近、体の調子がいい。",
    exampleRuby: "最近[さいきん]、体[からだ]の調子[ちょうし]がいい。",
    exampleKana: "さいきん、からだのちょうしがいい。",
    exampleViet: "Gần đây tình trạng cơ thể tôi rất tốt."
  },
  {
    id: 17,
    type: 'vocab',
    kanji: "熱",
    kana: "ねつ",
    viet: "sốt; nhiệt, sức nóng",
    hanViet: "NHIỆT",
    partOfSpeech: "Danh từ",
    example: "熱が38度出たので、会社を休んだ。",
    exampleRuby: "熱[ねつ]が38度[ど]出[で]たので、会社[かいしゃ]を休[やす]んだ。",
    exampleKana: "ねつが38どでたので、かいしゃをやすんだ。",
    exampleViet: "Vì bị sốt 38 độ nên tôi đã xin nghỉ làm ở công ty."
  },
  {
    id: 18,
    type: 'vocab',
    kanji: "急ぎ",
    kana: "いそぎ",
    viet: "khẩn cấp, vội vàng, việc gấp",
    hanViet: "CẤP",
    partOfSpeech: "Danh từ",
    example: "課長から急ぎの仕事を頼まれた。",
    exampleRuby: "課長[かちょう]から急[いそ]ぎの仕事[しごと]を頼[たの]まれた。",
    exampleKana: "かちょうからいそぎのしごとをたのまれた。",
    exampleViet: "Tôi được trưởng phòng giao cho một công việc gấp."
  },
  {
    id: 19,
    type: 'vocab',
    kanji: "性格",
    kana: "せいかく",
    viet: "tính cách",
    hanViet: "TÍNH CÁCH",
    partOfSpeech: "Danh từ",
    example: "山田さんは明るい性格ですね。",
    exampleRuby: "山田[やまだ]さんは明[あか]るい性格[せいかく]ですね。",
    exampleKana: "やまださんはあかるいせいかくですね。",
    exampleViet: "Anh Yamada có tính cách vui vẻ hoạt bát nhỉ."
  },
  {
    id: 20,
    type: 'vocab',
    kanji: "始め",
    kana: "はじめ",
    viet: "lúc bắt đầu, lúc đầu",
    hanViet: "THỦY",
    partOfSpeech: "Danh từ",
    example: "授業の始めにテストがあります。",
    exampleRuby: "授業[じゅぎょう]の始[はじ]めにテストがあります。",
    exampleKana: "じゅぎょうのはじめにテストがあります。",
    exampleViet: "Đầu buổi học sẽ có một bài kiểm tra."
  },
  {
    id: 21,
    type: 'vocab',
    kanji: "始まり",
    kana: "はじまり",
    viet: "sự khởi đầu, bắt đầu",
    hanViet: "THỦY",
    partOfSpeech: "Danh từ",
    example: "ここからが本当の始まりだ。",
    exampleRuby: "ここからが本当[ほんとう]の始[はじ]まりだ。",
    exampleKana: "ここからがほんとうのはじまりだ。",
    exampleViet: "Từ đây mới là sự khởi đầu thực sự."
  },
  {
    id: 22,
    type: 'vocab',
    kanji: "将来",
    kana: "しょうらい",
    viet: "tương lai",
    hanViet: "TƯƠNG LAI",
    partOfSpeech: "Danh từ",
    example: "将来は医者になりたいです。",
    exampleRuby: "将来[しょうらい]は医者[いしゃ]になりたいです。",
    exampleKana: "しょうらいはいしゃになりたいです。",
    exampleViet: "Trong tương lai tôi muốn trở thành bác sĩ."
  },
  {
    id: 23,
    type: 'vocab',
    kanji: "給料",
    kana: "きゅうりょう",
    viet: "tiền lương",
    hanViet: "CẤP LIỆU",
    partOfSpeech: "Danh từ",
    example: "来月から給料が少し上がります。",
    exampleRuby: "来月[らいげつ]から給料[きゅうりょう]が少[すこ]し上[あ]がります。",
    exampleKana: "らいげつからきゅうりょうがすこしあがります。",
    exampleViet: "Từ tháng sau tiền lương sẽ tăng một chút."
  },
  {
    id: 24,
    type: 'vocab',
    kanji: "暮らし",
    kana: "くらし",
    viet: "cuộc sống, sinh hoạt",
    hanViet: "MỘ",
    partOfSpeech: "Danh từ",
    example: "一人暮らしは大変ですが、楽しいです。",
    exampleRuby: "一人暮[ひとりぐ]らしは大変[たいへん]ですが、楽[たの]しいです。",
    exampleKana: "ひとりぐらしはたいへんですが、たのしいです。",
    exampleViet: "Sống một mình vất vả nhưng rất vui."
  },
  {
    id: 25,
    type: 'vocab',
    kanji: "壁",
    kana: "かべ",
    viet: "bức tường",
    hanViet: "BÍCH",
    partOfSpeech: "Danh từ",
    example: "壁にカレンダーを掛けました。",
    exampleRuby: "壁[かべ]にカレンダーを掛[か]けました。",
    exampleKana: "かべにカレンダーをかけました。",
    exampleViet: "Tôi đã treo lịch lên tường."
  },
  {
    id: 26,
    type: 'vocab',
    kanji: "機械",
    kana: "きかい",
    viet: "máy móc, thiết bị",
    hanViet: "CƠ GIỚI",
    partOfSpeech: "Danh từ",
    example: "この機械の使い方が分かりません。",
    exampleRuby: "この機械[きかい]の使[つか]い方[かた]が分[わ]かりません。",
    exampleKana: "このきかいのつかいかたがわかりません。",
    exampleViet: "Tôi không biết cách sử dụng cỗ máy này."
  },
  {
    id: 27,
    type: 'vocab',
    kanji: "電球",
    kana: "でんきゅう",
    viet: "bóng đèn tròn",
    hanViet: "ĐIỆN CẦU",
    partOfSpeech: "Danh từ",
    example: "部屋の電球が切れてしまった。",
    exampleRuby: "部屋[へや]の電球[でんきゅう]が切[き]れてしまった。",
    exampleKana: "へやのでんきゅうがきれてしまった。",
    exampleViet: "Bóng đèn trong phòng đã bị cháy rồi."
  },
  {
    id: 28,
    type: 'vocab',
    kanji: "前日",
    kana: "ぜんじつ",
    viet: "ngày hôm trước",
    hanViet: "TIỀN NHẬT",
    partOfSpeech: "Danh từ",
    example: "試験の前日は早く寝ました。",
    exampleRuby: "試験[しけん]の前日[ぜんじつ]は早[はや]く寝[ね]ました。",
    exampleKana: "しけんのぜんじつははやくねました。",
    exampleViet: "Ngày trước kỳ thi tôi đã đi ngủ sớm."
  },
  {
    id: 29,
    type: 'vocab',
    kanji: "全力",
    kana: "ぜんりょく",
    viet: "toàn lực, hết sức",
    hanViet: "TOÀN LỰC",
    partOfSpeech: "Danh từ",
    example: "最後まで全力で走りました。",
    exampleRuby: "最後[さいご]まで全力[ぜんりょく]で走[はし]りました。",
    exampleKana: "さいごまでぜんりょくではしりました。",
    exampleViet: "Tôi đã chạy hết sức lực cho tới phút cuối cùng."
  },
  {
    id: 30,
    type: 'vocab',
    kanji: "悲しみ",
    kana: "かなしみ",
    viet: "nỗi buồn",
    hanViet: "BI",
    partOfSpeech: "Danh từ",
    example: "彼の言葉には深い悲しみがあった。",
    exampleRuby: "彼[かれ]の言葉[ことば]には深[ふか]い悲[かな]しみがあった。",
    exampleKana: "かれのことばにはふかいかなしみがあった。",
    exampleViet: "Trong từng lời nói của anh ấy chất chứa một nỗi buồn sâu thẳm."
  }
];

// Combine all cards for Lesson 1 (Kanji cards first, then related vocab, then base vocab)
export const LESSON_1_CARDS: Flashcard[] = [
  ...LESSON_1_KANJI_CARDS,
  ...LESSON_1_RELATED_VOCAB_CARDS,
  ...LESSON_1_BASE_VOCAB_CARDS
];

// Sample Lesson 2 (Communication & Daily Action)
export const LESSON_2_CARDS: Flashcard[] = [
  {
    id: 201,
    type: 'kanji',
    kanji: "調",
    kana: "チョウ / しら.べる, ととの.う",
    viet: "điều tra, điều hòa, nhịp điệu",
    hanViet: "ĐIỀU",
    onyomi: "チョウ",
    kunyomi: "しら.べる, ととの.う, ととの.える",
    partOfSpeech: "Hán tự",
    vocabList: [
      { kanji: "調べる", kana: "しらべる", hanViet: "ĐIỀU", meaning: "tìm hiểu, tra cứu" },
      { kanji: "調子", kana: "ちょうし", hanViet: "ĐIỀU TỬ", meaning: "tình trạng, trạng thái" },
      { kanji: "調査", kana: "ちょうさ", hanViet: "ĐIỀU TRA", meaning: "điều tra, khảo sát" }
    ],
    example: "辞書で意味を調べます。",
    exampleRuby: "辞書[じしょ]で意味[いみ]を調[しら]べます。",
    exampleKana: "じしょでいみをしらべます。",
    exampleViet: "Tra cứu ý nghĩa bằng từ điển."
  },
  {
    id: 202,
    type: 'kanji',
    kanji: "始",
    kana: "シ / はじ.まる, はじ.める",
    viet: "bắt đầu, khởi đầu",
    hanViet: "THỦY",
    onyomi: "シ",
    kunyomi: "はじ.まる, はじ.める",
    partOfSpeech: "Hán tự",
    vocabList: [
      { kanji: "始める", kana: "はじめる", hanViet: "THỦY", meaning: "bắt đầu (tha động từ)" },
      { kanji: "始まる", kana: "はじまる", hanViet: "THỦY", meaning: "bắt đầu (tự động từ)" },
      { kanji: "開始", kana: "かいし", hanViet: "KHAI THỦY", meaning: "bắt đầu, khởi sự" }
    ],
    example: "会議を始めましょう。",
    exampleRuby: "会議[かいぎ]を始[はじ]めましょう。",
    exampleKana: "かいぎをはじめましょう。",
    exampleViet: "Chúng ta hãy bắt đầu cuộc họp nào."
  },
  {
    id: 203,
    type: 'vocab',
    kanji: "調べる",
    kana: "しらべる",
    viet: "tìm hiểu, tra cứu, điều tra",
    hanViet: "ĐIỀU",
    partOfSpeech: "Động từ",
    example: "インターネットで電車の時刻を調べた。",
    exampleRuby: "インターネットで電車[でんしゃ]の時刻[じこく]を調[しら]べた。",
    exampleKana: "インターネットででんしゃのじこくをしらべた。",
    exampleViet: "Tôi đã tra cứu giờ tàu điện trên Internet."
  },
  {
    id: 204,
    type: 'vocab',
    kanji: "始める",
    kana: "はじめる",
    viet: "bắt đầu, khởi xướng",
    hanViet: "THỦY",
    partOfSpeech: "Động từ",
    example: "日本語の勉強を始めました。",
    exampleRuby: "日本語[にほんご]の勉強[べんきょう]を始[はじ]めました。",
    exampleKana: "にほんごのべんきょうをはじめました。",
    exampleViet: "Tôi đã bắt đầu học tiếng Nhật."
  }
];

export const LESSONS: Lesson[] = [
  {
    id: "lesson-1",
    title: "Lesson 1: Core Kanji & N3 Vocab",
    description: "Kanji: 回, 因, 困, 恥, 取, 最, 亡, 忘, 望, 忙, 慣, 情 and related vocabulary",
    level: "N3",
    cards: LESSON_1_CARDS
  },
  {
    id: "lesson-2",
    title: "Lesson 2: Daily Actions & Communication",
    description: "Kanji: 調, 始 and essential vocabulary",
    level: "N3",
    cards: LESSON_2_CARDS
  }
];

// Default dataset for backward compatibility
export const DATA: Flashcard[] = LESSON_1_CARDS;
