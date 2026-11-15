export interface FormulaBlock {
  labels: string[];
  stack: string[];
  operator?: string;
  fixed: string[];
  note?: string;
}

export interface GrammarExample {
  jp: string;
  ruby: string;
  highlight: string;
  vi: string;
}

export interface GrammarExerciseItem {
  vi: string;
  jp: string;
  ruby?: string;
}

export interface GrammarExercise {
  title: string;
  items: GrammarExerciseItem[];
}

export interface GrammarItem {
  id: number;
  pattern: string;
  meaning: string;
  formulas: FormulaBlock[];
  notes?: string[];
  examples: GrammarExample[];
  exercises?: GrammarExercise;
}

export interface GrammarQuizQuestion {
  id: string;
  grammarId: number;
  grammarPattern: string;
  direction: 'jp-to-vi' | 'vi-to-jp';
  question: string;
  questionRuby?: string;
  options: string[];
  optionsRuby?: string[];
  correctIndex: number;
  explanation: string;
  audioText: string;
}

export interface LessonGrammar {
  lessonId: string;
  chapterTitle: string;
  lessonTitle: string;
  subtitle: string;
  items: GrammarItem[];
  quiz: GrammarQuizQuestion[];
}

export const LESSON_1_GRAMMAR: LessonGrammar = {
  lessonId: "lesson-1",
  chapterTitle: "CHƯƠNG 1",
  lessonTitle: "BÀI 1",
  subtitle: "Ngữ Pháp Tiếng Nhật",
  items: [
    {
      id: 1,
      pattern: "～ば～ほど",
      meaning: "Càng... càng...",
      formulas: [
        {
          labels: [
            "Càng làm V thì càng...",
            "Càng (tính từ i) thì càng...",
            "Càng (tính từ na/danh từ) thì càng..."
          ],
          stack: [
            "V ば",
            "A いければ",
            "Aな / N なら"
          ],
          operator: "+",
          fixed: [
            "V る ほど",
            "A い ほど",
            "Aな / N な ほど"
          ]
        }
      ],
      examples: [
        {
          jp: "日本語が上手であればあるほど、日本の会社で働きやすくなる。",
          ruby: "日本語[にほんご]が上手[じょうず]であればあるほど、日本[にほん]の会社[かいしゃ]で働[はたら]きやすくなる。",
          highlight: "上手であればあるほど",
          vi: "Tiếng Nhật càng giỏi thì càng dễ làm việc ở công ty Nhật."
        }
      ]
    },
    {
      id: 2,
      pattern: "～ようなら",
      meaning: "Nếu như... (giả sử xảy ra)",
      formulas: [
        {
          labels: [
            "Nếu như (hành động/trạng thái)...",
            "Nếu như là (tính từ na/danh từ)..."
          ],
          stack: [
            "Vる / Vない / Aい",
            "Aな / N"
          ],
          operator: "+",
          fixed: [
            "よう + なら",
            "よう + なら / であれば"
          ]
        }
      ],
      examples: [
        {
          jp: "この問題が解けないようなら、大学に行くのは無理だよ。",
          ruby: "この問題[もんだい]が解[と]けないようなら、大学[だいがく]に行[い]くのは無理[むり]だよ。",
          highlight: "解けないようなら",
          vi: "Nếu như không giải được bài này thì đại học là vô vọng đấy."
        }
      ]
    },
    {
      id: 3,
      pattern: "～ように",
      meaning: "Để V / Để không V",
      formulas: [
        {
          labels: [
            "Để làm V",
            "Để không làm V"
          ],
          stack: [
            "Vる",
            "Vない"
          ],
          operator: "+",
          fixed: [
            "ように",
            "ように"
          ]
        }
      ],
      examples: [
        {
          jp: "子供がゲームをやりすぎないように、2時間を超えて続けていたら...",
          ruby: "子供[こども]がゲームをやりすぎないように、2時間[じかん]を超[こ]えて続[つづ]けていたら...",
          highlight: "やりすぎないように",
          vi: "Để bọn trẻ không chơi game quá nhiều, nếu chơi quá 2 tiếng thì..."
        }
      ]
    },
    {
      id: 4,
      pattern: "～ようにする",
      meaning: "(Sẽ) Cố gắng V / Không V",
      formulas: [
        {
          labels: [
            "Sẽ cố gắng làm V",
            "Sẽ cố gắng không làm V"
          ],
          stack: [
            "Vる",
            "Vない"
          ],
          operator: "+",
          fixed: [
            "ようにする",
            "ようにする"
          ]
        }
      ],
      examples: [
        {
          jp: "目に悪いから、寝る前にスマホを使わないようにしましょう。",
          ruby: "目[め]に悪[わる]いから、寝[ね]る前[まえ]にスマホを使[つか]わないようにしましょう。",
          highlight: "使わないようにしましょう",
          vi: "Vì hại mắt nên hãy cố gắng không dùng điện thoại trước khi ngủ."
        }
      ]
    },
    {
      id: 5,
      pattern: "～ようにしている",
      meaning: "Cố gắng duy trì thói quen",
      formulas: [
        {
          labels: [
            "Duy trì thói quen làm V",
            "Duy trì thói quen không làm V"
          ],
          stack: [
            "Vる",
            "Vない"
          ],
          operator: "+",
          fixed: [
            "ようにしている",
            "ようにしている"
          ]
        }
      ],
      examples: [
        {
          jp: "健康のために、毎日野菜を食べるようにしています。",
          ruby: "健康[けんこう]のために、毎日[まいにち]野菜[やさい]を食[た]べるようにしています。",
          highlight: "食べるようにしています",
          vi: "Vì sức khỏe, tôi cố gắng duy trì thói quen ăn rau mỗi ngày."
        }
      ]
    },
    {
      id: 6,
      pattern: "～ところだ",
      meaning: "Sắp / Đang / Vừa mới",
      formulas: [
        {
          labels: [
            "Sắp sửa / Chuẩn bị làm V",
            "Đúng vào lúc đang làm V",
            "Vừa mới làm V xong"
          ],
          stack: [
            "Vる",
            "Vている",
            "Vた"
          ],
          operator: "+",
          fixed: [
            "ところだ",
            "ところだ",
            "ところだ"
          ]
        }
      ],
      examples: [
        {
          jp: "これから取り替えるところ。",
          ruby: "これから取[と]り替[か]えるところ。",
          highlight: "取り替えるところ",
          vi: "Tôi chuẩn bị thay đây. (Sắp sửa)"
        },
        {
          jp: "ちょっとゴミを回収しているところでした。",
          ruby: "ちょっとゴミを回収[かいしゅう]しているところでした。",
          highlight: "ゴミを回収しているところ",
          vi: "Đúng lúc tôi đang thu gom rác."
        },
        {
          jp: "ちょうど今、受け取ったところです。",
          ruby: "ちょうど今[いま]、受[う]け取[と]ったところです。",
          highlight: "受け取ったところ",
          vi: "Đúng lúc tôi vừa mới nhận được."
        }
      ]
    },
    {
      id: 7,
      pattern: "～たばかり",
      meaning: "Vừa mới V",
      formulas: [
        {
          labels: [
            "Vừa mới làm V (cảm giác thời gian rất ngắn)"
          ],
          stack: [
            "Vた"
          ],
          operator: "+",
          fixed: [
            "ばかり"
          ]
        }
      ],
      examples: [
        {
          jp: "さっき帰ってきたばかりなので、まだメールをチェックしていないんです。",
          ruby: "さっき帰[かえ]ってきたばかりなので、まだメールをチェックしていないんです。",
          highlight: "帰ってきたばかり",
          vi: "Vì tôi vừa mới về lúc nãy nên vẫn chưa kiểm tra email."
        }
      ]
    }
  ],
  quiz: [
    {
      id: "q1",
      grammarId: 1,
      grammarPattern: "～ば～ほど",
      direction: "jp-to-vi",
      question: "日本語が上手であればあるほど、日本の会社で働きやすくなる。",
      questionRuby: "日本語[にほんご]が上手[じょうず]であればあるほど、日本[にほん]の会社[かいしゃ]で働[はたら]きやすくなる。",
      audioText: "日本語が上手であればあるほど、日本の会社で働きやすくなる。",
      options: [
        "Tiếng Nhật càng giỏi thì càng dễ làm việc ở công ty Nhật.",
        "Nếu tiếng Nhật không giỏi thì không thể làm việc ở công ty Nhật.",
        "Tôi đang cố gắng học giỏi tiếng Nhật để làm ở công ty Nhật.",
        "Vì vừa mới giỏi tiếng Nhật nên tôi đã xin được vào công ty Nhật."
      ],
      correctIndex: 0,
      explanation: "「Aであればあるほど」: Càng (A) thì càng... Tiếng Nhật càng giỏi thì càng dễ làm việc."
    },
    {
      id: "q2",
      grammarId: 2,
      grammarPattern: "～ようなら",
      direction: "jp-to-vi",
      question: "この問題が解けないようなら、大学に行くのは無理だよ。",
      questionRuby: "この問題[もんだい]が解[と]けないようなら、大学[だいがく]に行[い]くのは無理[むり]だよ。",
      audioText: "この問題が解けないようなら、大学に行くのは無理だよ。",
      options: [
        "Vì không giải được câu này nên tôi không muốn vào đại học.",
        "Nếu như không giải được bài này thì đại học là vô vọng đấy.",
        "Để giải được bài này, tôi phải cố gắng vào đại học.",
        "Tôi vừa mới giải xong bài này trước khi đi học đại học."
      ],
      correctIndex: 1,
      explanation: "「Vないようなら」: Nếu như (không giải được) thì..."
    },
    {
      id: "q3",
      grammarId: 3,
      grammarPattern: "～ように",
      direction: "jp-to-vi",
      question: "子供がゲームをやりすぎないように、2時間を超えて続けていたら注意する。",
      questionRuby: "子供[こども]がゲームをやりすぎないように、2時間[じかん]を超[こ]えて続[つづ]けていたら注意[ちゅうい]する。",
      audioText: "子供がゲームをやりすぎないように、2時間を超えて続けていたら注意する。",
      options: [
        "Bọn trẻ vừa mới chơi game xong sau hơn 2 tiếng đồng hồ.",
        "Nếu bọn trẻ không thích chơi game thì sẽ không chơi quá 2 tiếng.",
        "Để bọn trẻ không chơi game quá nhiều, nếu quá 2 tiếng sẽ nhắc nhở.",
        "Bọn trẻ càng chơi game nhiều thì càng khó dừng lại."
      ],
      correctIndex: 2,
      explanation: "「Vないように」: Để không làm V (chỉ mục đích)."
    },
    {
      id: "q4",
      grammarId: 4,
      grammarPattern: "～ようにする",
      direction: "jp-to-vi",
      question: "目に悪いから、寝る前にスマホを使わないようにしましょう。",
      questionRuby: "目[め]に悪[わる]いから、寝[ね]る前[まえ]にスマホを使[つか]わないようにしましょう。",
      audioText: "目に悪いから、寝る前にスマホを使わないようにしましょう。",
      options: [
        "Vì hại mắt nên tôi vừa mới ngưng dùng điện thoại trước khi đi ngủ.",
        "Dùng điện thoại trước khi ngủ càng nhiều thì mắt càng yếu đi.",
        "Nếu dùng điện thoại trước khi ngủ thì mắt sẽ bị hỏng.",
        "Vì hại mắt nên hãy cố gắng không dùng điện thoại trước khi ngủ."
      ],
      correctIndex: 3,
      explanation: "「Vないようにする」: Cố gắng / sẽ cố gắng không làm V."
    },
    {
      id: "q5",
      grammarId: 5,
      grammarPattern: "～ようにしている",
      direction: "jp-to-vi",
      question: "健康のために、毎日野菜を食べるようにしています。",
      questionRuby: "健康[けんこう]のために、毎日[まいにち]野菜[やさい]を食[た]べるようにしています。",
      audioText: "健康のために、毎日野菜を食べるようにしています。",
      options: [
        "Vì sức khỏe, tôi cố gắng duy trì thói quen ăn rau mỗi ngày.",
        "Để có sức khỏe tốt, tôi chuẩn bị đi mua rau ăn.",
        "Rau càng tươi ngon thì càng tốt cho sức khỏe của tôi.",
        "Tôi vừa mới ăn xong một đĩa rau vì sức khỏe."
      ],
      correctIndex: 0,
      explanation: "「Vるようにしている」: Thói quen luôn cố gắng duy trì đều đặn."
    },
    {
      id: "q6",
      grammarId: 6,
      grammarPattern: "～ところだ",
      direction: "jp-to-vi",
      question: "これから取り替えるところ。",
      questionRuby: "これから取[と]り替[か]えるところ。",
      audioText: "これから取り替えるところ。",
      options: [
        "Tôi vừa mới thay thế xong tức thì.",
        "Tôi chuẩn bị thay đây. (Sắp sửa làm)",
        "Tôi đang trong quá trình thay thế phụ tùng.",
        "Càng thay thế nhiều thì càng tốn kém."
      ],
      correctIndex: 1,
      explanation: "「Vる + ところだ」: Sắp sửa / chuẩn bị làm V."
    },
    {
      id: "q7",
      grammarId: 6,
      grammarPattern: "～ところだ",
      direction: "jp-to-vi",
      question: "ちょっとゴミを回収しているところでした。",
      questionRuby: "ちょっとゴミを回収[かいしゅう]しているところでした。",
      audioText: "ちょっとゴミを回収しているところでした。",
      options: [
        "Tôi vừa mới thu gom rác xong lúc nãy.",
        "Tôi sắp sửa đi gom rác đây.",
        "Đúng lúc tôi đang thu gom rác.",
        "Tôi cố gắng gom rác mỗi ngày như một thói quen."
      ],
      correctIndex: 2,
      explanation: "「Vている + ところだ」: Đúng vào lúc đang diễn ra hành động."
    },
    {
      id: "q8",
      grammarId: 7,
      grammarPattern: "～たばかり",
      direction: "jp-to-vi",
      question: "さっき帰ってきたばかりなので、まだメールをチェックしていないんです。",
      questionRuby: "さっき帰[かえ]ってきたばかりなので、まだメールをチェックしていないんです。",
      audioText: "さっき帰ってきたばかりなので、まだメールをチェックしていないんです。",
      options: [
        "Vì tôi đang chuẩn bị về nhà nên chưa kịp kiểm tra email.",
        "Để về nhà sớm, tôi đã không kiểm tra email nữa.",
        "Nếu về đến nhà mà chưa thấy email thì tôi sẽ kiểm tra sau.",
        "Vì tôi vừa mới về lúc nãy nên vẫn chưa kiểm tra email."
      ],
      correctIndex: 3,
      explanation: "「Vたばかり」: Vừa mới làm V trong cảm nhận người nói."
    },
    {
      id: "q9",
      grammarId: 1,
      grammarPattern: "～ば～ほど",
      direction: "vi-to-jp",
      question: "Tiếng Nhật càng giỏi thì càng dễ làm việc ở công ty Nhật.",
      audioText: "日本語が上手であればあるほど、日本の会社で働きやすくなる。",
      options: [
        "日本語が上手であればあるほど、日本の会社で働きやすくなる。",
        "日本語が上手なようなら、日本の会社で働くようにする。",
        "日本語が上手になるように、日本の会社で働いているところだ。",
        "日本語が上手になったばかりなので、日本の会社で働けない。"
      ],
      optionsRuby: [
        "日本語[にほんご]が上手[じょうず]であればあるほど、日本[にほん]の会社[かいしゃ]で働[はたら]きやすくなる。",
        "日本語[にほんご]が上手[じょうず]なようなら、日本[にほん]の会社[かいしゃ]で働[はたら]くようにする。",
        "日本語[にほんご]が上手[じょうず]になるように、日本[にほん]の会社[かいしゃ]で働[はたら]いているところだ。",
        "日本語[にほんご]が上手[じょうず]になったばかりなので、日本[にほん]の会社[かいしゃ]で働[はたら]けない。"
      ],
      correctIndex: 0,
      explanation: "Càng... càng... sử dụng「～ば～ほど」(Aななら / であれば + Aななほど)."
    },
    {
      id: "q10",
      grammarId: 2,
      grammarPattern: "～ようなら",
      direction: "vi-to-jp",
      question: "Nếu như không giải được bài này thì đại học là vô vọng đấy.",
      audioText: "この問題が解けないようなら、大学に行くのは無理だよ。",
      options: [
        "この問題が解けるように、大学に行くようにしている。",
        "この問題が解けないようなら、大学に行くのは無理だよ。",
        "この問題を解いたばかりだから、大学に行けるはずだ。",
        "この問題が解ければ解けるほど、大学に行くのが無理になる。"
      ],
      optionsRuby: [
        "この問題[もんだい]が解[と]けるように、大学[だいがく]に行[い]くようにしている。",
        "この問題[もんだい]が解[と]けないようなら、大学[だいがく]に行[い]くのは無理[むり]だよ。",
        "この問題[もんだい]を解[と]いたばかりだから、大学[だいがく]に行[い]けるはずだ。",
        "この問題[もんだい]が解[と]ければ解[と]けるほど、大学[だいがく]に行[い]くのが無理[むり]になる。"
      ],
      correctIndex: 1,
      explanation: "Nếu như... (giả sử xảy ra trường hợp đó) ->「～ようなら」."
    },
    {
      id: "q11",
      grammarId: 4,
      grammarPattern: "～ようにする",
      direction: "vi-to-jp",
      question: "Vì hại mắt nên hãy cố gắng không dùng điện thoại trước khi ngủ.",
      audioText: "目に悪いから、寝る前にスマホを使わないようにしましょう。",
      options: [
        "目に悪いから、寝る前にスマホを使うところです。",
        "目に悪いから、寝る前にスマホを使えば使うほど眠れなくなる。",
        "目に悪いから、寝る前にスマホを使わないようにしましょう。",
        "目に悪いから、寝る前にスマホを使ったばかりです。"
      ],
      optionsRuby: [
        "目[め]に悪[わる]いから、寝[ね]る前[まえ]にスマホを使[つか]うところです。",
        "目[め]に悪[わる]いから、寝[ね]る前[まえ]にスマホを使[つか]えば使[つか]うほど眠[ねむ]れなくなる。",
        "目[め]に悪[わる]いから、寝[ね]る前[まえ]にスマホを使[つか]わないようにしましょう。",
        "目[め]に悪[わる]いから、寝[ね]る前[まえ]にスマホを使[つか]ったばかりです。"
      ],
      correctIndex: 2,
      explanation: "Lời khuyên cố gắng không làm V ->「～ないようにする (ましょう)」."
    },
    {
      id: "q12",
      grammarId: 6,
      grammarPattern: "～ところだ",
      direction: "vi-to-jp",
      question: "Đúng lúc tôi vừa mới nhận được (hàng/thư).",
      audioText: "ちょうど今、受け取ったところです。",
      options: [
        "ちょうど今、受け取るようにしています。",
        "ちょうど今、受け取れば受け取るほど嬉しいです。",
        "ちょうど今、受け取らないようなら連絡します。",
        "ちょうど今、受け取ったところです。"
      ],
      optionsRuby: [
        "ちょうど今[いま]、受[う]け取[と]るようにしています。",
        "ちょうど今[いま]、受[う]け取[と]れば受[う]け取[と]るほど嬉[うれ]しいです。",
        "ちょうど今[いま]、受[う]け取[と]らないようなら連絡[れんらく]します。",
        "ちょうど今[いま]、受[う]け取[と]ったところです。"
      ],
      correctIndex: 3,
      explanation: "Vừa mới làm V xong tại đúng thời điểm hiện tại:「Vた + ところです」."
    }
  ]
};

export const LESSON_2_GRAMMAR: LessonGrammar = {
  lessonId: "lesson-2",
  chapterTitle: "CHƯƠNG 1",
  lessonTitle: "BÀI 2",
  subtitle: "Ngữ Pháp Tiếng Nhật",
  items: [
    {
      id: 1,
      pattern: "〜って (1)",
      meaning: "Nhấn mạnh chủ đề (thay cho は trong văn nói)",
      formulas: [
        {
          labels: ["Đặt ngay sau danh từ làm chủ đề câu"],
          stack: ["N"],
          operator: "+",
          fixed: ["って"]
        }
      ],
      notes: [
        "Đứng ngay sau danh từ (N) đóng vai trò là chủ đề của câu.",
        "Dùng để thay thế cho trợ từ は nhằm nhấn mạnh chủ đề muốn nói đến.",
        "Đây là cách nói đặc trưng trong văn nói (hội thoại thân mật)."
      ],
      examples: [
        {
          jp: "あなたの恋人ってどんな人ですか。",
          ruby: "あなたの恋人[こいびと]ってどんな人[ひと]ですか。",
          highlight: "恋人って",
          vi: "Người yêu của bạn là người như thế nào?"
        },
        {
          jp: "日本語ってどうすれば上手になりますか。",
          ruby: "日本語[にほんご]ってどうすれば上手[じょうず]になりますか。",
          highlight: "日本語って",
          vi: "Tiếng Nhật thì làm thế nào để trở nên giỏi hơn?"
        },
        {
          jp: "すみません、会社のパーティーっていつですか。",
          ruby: "すみません、会社[かいしゃ]のパーティーっていつですか。",
          highlight: "パーティーって",
          vi: "Xin lỗi, bữa tiệc của công ty là khi nào vậy ạ?"
        }
      ],
      exercises: {
        title: "Dịch những câu sau sang tiếng Nhật",
        items: [
          {
            vi: "Nghe nói núi Phú Sĩ là ngọn núi cao nhất Nhật Bản.",
            jp: "富士山って日本で一番高い山なんだって。",
            ruby: "富士山[ふじさん]って日本[にほん]で一番[いちばん]高[たか]い山[やま]なんだって。"
          },
          {
            vi: "Tiếng Nhật có khó không?",
            jp: "日本語って難しいですか。",
            ruby: "日本語[にほんご]って難[むずか]しいですか。"
          },
          {
            vi: "Nhật Bản là nước như thế nào?",
            jp: "日本ってどんな国ですか。",
            ruby: "日本[にほん]ってどんな国[くに]ですか。"
          }
        ]
      }
    },
    {
      id: 2,
      pattern: "〜って (2)",
      meaning: "Nghe nói là... / Thấy bảo là...",
      formulas: [
        {
          labels: [
            "Động từ thể thường",
            "Tính từ đuôi い",
            "Danh từ / Tính từ đuôi な"
          ],
          stack: [
            "V (普) (+んだ)",
            "Aい (+んだ)",
            "N / Aな (+なん) だ"
          ],
          operator: "+",
          fixed: [
            "って",
            "って",
            "って"
          ]
        }
      ],
      notes: [
        "Mẫu câu dùng để trích dẫn lại lời người khác, thông tin nghe từ nơi khác.",
        "Cách nói thường nghe khác: なんだって。"
      ],
      examples: [
        {
          jp: "今週はずっと晴れだって。",
          ruby: "今週[こんしゅう]はずっと晴[は]れだって。",
          highlight: "晴れだって",
          vi: "Nghe nói tuần này trời nắng suốt đấy."
        },
        {
          jp: "彼は今日、遅刻して先生におこられたって。",
          ruby: "彼[かれ]は今日[きょう]、遅刻[ちこく]して先生[せんせい]におこられたって。",
          highlight: "おこられたって",
          vi: "Thấy bảo hôm nay anh ấy đi muộn nên bị thầy mắng đấy."
        },
        {
          jp: "その荷物は小さいけど結構重いって。",
          ruby: "その荷物[にもつ]は小[ちい]さいけど結構[けっこう]重[おも]いって。",
          highlight: "重いって",
          vi: "Nghe nói hành lý đó tuy nhỏ nhưng khá nặng đấy."
        },
        {
          jp: "これは昔のアニメだけど、海外では今でも人気なんだって。",
          ruby: "これは昔[むかし]のアニメだけど、海外[かいがい]では今[いま]でも人気[にんき]なんだって。",
          highlight: "人気なんだって",
          vi: "Đây là anime ngày xưa nhưng nghe nói ở nước ngoài bây giờ vẫn rất nổi tiếng đấy."
        }
      ],
      exercises: {
        title: "Dịch những câu sau sang tiếng Nhật",
        items: [
          {
            vi: "Thấy bảo hai người đấy đang hẹn hò với nhau.",
            jp: "あの二人は付き合っているんだって。",
            ruby: "あの二人[ふたり]は付[つ]き合[あ]っているんだって。"
          },
          {
            vi: "Nghe nói cô Thanh có em bé rồi.",
            jp: "タインさんは赤ちゃんができたんだって。",
            ruby: "タインさんは赤[あか]ちゃんができたんだって。"
          },
          {
            vi: "Nghe nói cô ấy đỗ N3 rồi.",
            jp: "彼女はN3に合格したんだって。",
            ruby: "彼女[かのじょ]はN3に合格[ごうかく]したんだって。"
          }
        ]
      }
    },
    {
      id: 3,
      pattern: "〜って (3)",
      meaning: "Là... (trích dẫn lời nói / suy nghĩ / chữ viết)",
      formulas: [
        {
          labels: ["Dùng thay cho trợ từ と (と思う / と言う / と書いてある)"],
          stack: ["Mệnh đề (thể ngắn)"],
          operator: "+",
          fixed: ["って"]
        }
      ],
      notes: [
        "Mẫu câu dùng thay cho と trong: と思う / と言う / と書いてある (nghĩ là / nói là / viết là ~).",
        "Với câu hỏi: dùng 何て, không dùng 何って。"
      ],
      examples: [
        {
          jp: "彼と初めて話したけど、いい人だなって思った。",
          ruby: "彼[かれ]と初[はじ]めて話[はな]したけど、いい人[ひと]だなって思[おも]った。",
          highlight: "いい人だなって思った",
          vi: "Lần đầu tiên nói chuyện với anh ấy, tôi đã nghĩ anh ấy là người tốt."
        },
        {
          jp: "彼は来月から日本に留学するってみんなに言っていた。",
          ruby: "彼[かれ]は来月[らいげつ]から日本[にほん]に留学[りゅうがく]するってみんなに言[い]っていた。",
          highlight: "留学するって",
          vi: "Anh ấy đã nói với mọi người rằng từ tháng sau sẽ đi du học Nhật Bản."
        },
        {
          jp: "子供のとき、父にご飯は残さず全部食べろってよく言われた。",
          ruby: "子供[こども]のとき、父[ちち]にご飯[はん]は残[のこ]さず全部[ぜんぶ]食[た]べろってよく言[い]われた。",
          highlight: "全部食べろって",
          vi: "Hồi nhỏ, tôi thường bị bố bảo là cơm phải ăn hết không được để thừa."
        }
      ],
      exercises: {
        title: "Dịch những câu sau sang tiếng Nhật",
        items: [
          {
            vi: "(Trên tấm biển) Có viết là cấm vào.",
            jp: "立ち入り禁止って書いてある。",
            ruby: "立[た]ち入[い]り禁止[きんし]って書[か]いてある。"
          },
          {
            vi: "Tôi đã được khen là \"Con đã làm rất tốt\" đấy!",
            jp: "「よく頑張ったね」って褒められたよ。",
            ruby: "「よく頑張[がんば]ったね」って褒[ほ]められたよ。"
          }
        ]
      }
    },
    {
      id: 4,
      pattern: "〜って (4) / という",
      meaning: "N2 gọi là N1",
      formulas: [
        {
          labels: ["Giới thiệu hoặc gọi tên sự vật, sự việc cụ thể"],
          stack: ["N1"],
          operator: "+",
          fixed: ["という / って + N2"]
        }
      ],
      notes: [
        "Mẫu câu dùng để giới thiệu hoặc gọi tên một sự vật, sự việc cụ thể.",
        "N1 là tên riêng hoặc một danh từ cụ thể.",
        "N2 là danh từ cùng loại nhưng có phạm vi nghĩa rộng hơn N1.",
        "Văn nói: っていう / って。"
      ],
      examples: [
        {
          jp: "私は日本という国から来ました。",
          ruby: "私[わたし]は日本[にほん]という国[くに]から来[き]ました。",
          highlight: "日本という国",
          vi: "Tôi đến từ đất nước gọi là Nhật Bản."
        },
        {
          jp: "これはフォーという料理で、ベトナムではとても有名です。",
          ruby: "これはフォーという料理[りょうり]で、ベトナムではとても有名[ゆうめい]です。",
          highlight: "フォーという料理",
          vi: "Đây là món ăn gọi là Phở, ở Việt Nam rất nổi tiếng."
        },
        {
          jp: "私はズンモリって日本語センターで、N5からN2まで勉強した。",
          ruby: "私[わたし]はズンモリって日本語[にほんご]センターで、N5からN2まで勉強[べんきょう]した。",
          highlight: "ズンモリって日本語センター",
          vi: "Tôi đã học từ N5 đến N2 tại trung tâm tiếng Nhật tên là Dung Mori."
        }
      ],
      exercises: {
        title: "Dịch những cụm từ sau sang tiếng Nhật",
        items: [
          {
            vi: "Đất nước mang tên là Việt Nam",
            jp: "ベトナムという国",
            ruby: "ベトナムという国[くに]"
          },
          {
            vi: "Món ăn mà gọi là sushi",
            jp: "すしという料理",
            ruby: "すしという料理[りょうり]"
          },
          {
            vi: "Người mà tên là Thanh",
            jp: "タインという人",
            ruby: "タインという人[ひと]"
          }
        ]
      }
    },
    {
      id: 5,
      pattern: "〜らしい",
      meaning: "Ra dáng / đậm chất / chuẩn...",
      formulas: [
        {
          labels: [
            "Mang nét tiêu biểu, điển hình của N",
            "Kết hợp với danh từ đứng sau"
          ],
          stack: [
            "N",
            "N1 + らしい"
          ],
          operator: "+",
          fixed: [
            "らしい",
            "N2"
          ]
        }
      ],
      notes: [
        "Mẫu câu dùng để diễn tả một sự vật, sự việc hoặc đối tượng mang những đặc điểm tiêu biểu, điển hình của chính nó.",
        "N らしい dùng như 1 tính từ đuôi i.",
        "Có thể kết hợp được với danh từ đứng sau: 「N1 らしい N2」."
      ],
      examples: [
        {
          jp: "息子は高校生になり、だんだん大人らしい顔になってきた。",
          ruby: "息子[むすこ]は高校生[こうこうせい]になり、だんだん大人[おとな]らしい顔[かお]になってきた。",
          highlight: "大人らしい",
          vi: "Con trai đã lên cấp 3 nên khuôn mặt dần ra dáng người lớn."
        },
        {
          jp: "あの子は遊ばないで勉強ばかりしていて、子供らしくない。",
          ruby: "あの子[こ]は遊[あそ]ばないで勉強[べんきょう]ばかりしていて、子供[こども]らしくない。",
          highlight: "子供らしくない",
          vi: "Đứa bé đó không chơi đùa mà chỉ học suốt, chẳng giống trẻ con chút nào."
        }
      ],
      exercises: {
        title: "Dịch những câu sau sang tiếng Nhật",
        items: [
          {
            vi: "Hôm nay là một ngày đúng kiểu mùa hè nhỉ!",
            jp: "今日は夏らしい日ですね。",
            ruby: "今日[きょう]は夏[なつ]らしい日[ひ]ですね。"
          },
          {
            vi: "Cô Yuka có khuôn mặt đậm chất người Nhật.",
            jp: "ユカさんは日本人らしい顔をしている。",
            ruby: "ユカさんは日本人[にほんじん]らしい顔[かお]をしている。"
          },
          {
            vi: "Nếu không có pháo hoa thì đâu còn là mùa hè nữa.",
            jp: "花火がないと夏らしくないね。",
            ruby: "花火[はなび]がないと夏[なつ]らしくないね。"
          }
        ]
      }
    },
    {
      id: 6,
      pattern: "〜を中心",
      meaning: "Mà chủ yếu là... / trọng tâm là...",
      formulas: [
        {
          labels: [
            "Lấy N1 làm trọng tâm / chủ yếu",
            "Bổ nghĩa cho danh từ N2 (đã / đang lấy N1 làm trọng tâm)",
            "Bổ nghĩa cho danh từ N2 (lấy N1 làm trọng tâm)"
          ],
          stack: [
            "N1",
            "N1",
            "N1"
          ],
          operator: "+",
          fixed: [
            "を中心に / として",
            "を中心にした / とした + N2",
            "を中心にする / とする + N2"
          ]
        }
      ],
      notes: [
        "Diễn tả việc lấy N1 làm trung tâm, làm yếu tố chủ yếu hoặc trọng tâm của hành động, sự việc."
      ],
      examples: [
        {
          jp: "この教室では、会話を中心に勉強している。",
          ruby: "この教室[きょうしつ]では、会話[かいわ]を中心[ちゅうしん]に勉強[べんきょう]している。",
          highlight: "会話を中心に",
          vi: "Ở lớp học này, chúng tôi học tập trung chủ yếu vào hội thoại."
        },
        {
          jp: "文法を中心にした授業はつまらない。",
          ruby: "文法[ぶんぽう]を中心[ちゅうしん]にした授業[じゅぎょう]はつまらない。",
          highlight: "文法を中心にした",
          vi: "Giờ học lấy ngữ pháp làm trọng tâm thì thật nhàm chán."
        },
        {
          jp: "食事を中心としたダイエットをしている。",
          ruby: "食事[しょくじ]を中心[ちゅうしん]としたダイエットをしている。",
          highlight: "食事を中心とした",
          vi: "Tôi đang thực hiện chế độ ăn kiêng lấy ăn uống làm trọng tâm."
        }
      ],
      exercises: {
        title: "Dịch những câu sau sang tiếng Nhật",
        items: [
          {
            vi: "Cuốn sách này giải thích lấy ví dụ làm trọng tâm.",
            jp: "この本は例文を中心に説明している。",
            ruby: "この本[ほん]は例文[れいぶん]を中心[ちゅうしん]に説明[せつめい]している。"
          },
          {
            vi: "Tháng này chúng tôi tổ chức sự kiện chủ yếu dành cho học sinh.",
            jp: "今月は学生を中心としたイベントを行う。",
            ruby: "今月[こんげつ]は学生[がくせい]を中心[ちゅうしん]としたイベントを行[おこな]う。"
          },
          {
            vi: "Hãy luyện tập tập trung vào phần phát âm.",
            jp: "発音を中心に練習しましょう。",
            ruby: "発音[はつおん]を中心[ちゅうしん]に練習[れんしゅう]しましょう。"
          }
        ]
      }
    }
  ],
  quiz: [
    {
      id: "l2-q1",
      grammarId: 1,
      grammarPattern: "〜って (1)",
      direction: "jp-to-vi",
      question: "あなたの恋人ってどんな人ですか。",
      questionRuby: "あなたの恋人[こいびと]ってどんな人[ひと]ですか。",
      audioText: "あなたの恋人ってどんな人ですか。",
      options: [
        "Người yêu của bạn là người như thế nào?",
        "Nghe nói bạn đã có người yêu rồi phải không?",
        "Người yêu của bạn rất ra dáng người lớn.",
        "Bạn có nghĩ người yêu của mình là người tốt không?"
      ],
      correctIndex: 0,
      explanation: "「N + って」thay cho trợ từ は trong văn nói thân mật để nêu chủ đề câu."
    },
    {
      id: "l2-q2",
      grammarId: 2,
      grammarPattern: "〜って (2)",
      direction: "jp-to-vi",
      question: "今週はずっと晴れだって。",
      questionRuby: "今週[こんしゅう]はずっと晴[は]れだって。",
      audioText: "今週はずっと晴れだって。",
      options: [
        "Tuần này chắc chắn trời sẽ nắng đẹp.",
        "Nghe nói tuần này trời nắng suốt đấy.",
        "Tuần này có thời tiết đúng chất mùa hè.",
        "Mọi người đang nói về thời tiết tuần này."
      ],
      correctIndex: 1,
      explanation: "「N / Aな + だ + って」diễn tả thông tin nghe lại từ người khác (Nghe nói là...)."
    },
    {
      id: "l2-q3",
      grammarId: 2,
      grammarPattern: "〜って (2)",
      direction: "jp-to-vi",
      question: "これは昔のアニメだけど、海外では今でも人気なんだって。",
      questionRuby: "これは昔[むかし]のアニメだけど、海外[かいがい]では今[いま]でも人気[にんき]なんだって。",
      audioText: "これは昔のアニメだけど、海外では今でも人気なんだって。",
      options: [
        "Đây là anime cũ nên ở nước ngoài chẳng ai xem nữa.",
        "Anime này lấy văn hóa nước ngoài làm trọng tâm.",
        "Đây là anime ngày xưa nhưng nghe nói ở nước ngoài bây giờ vẫn rất nổi tiếng đấy.",
        "Tôi nghĩ bộ anime này rất đậm chất Nhật Bản."
      ],
      correctIndex: 2,
      explanation: "「N / Aな + なんだって」dùng để truyền đạt lại điều mình nghe được."
    },
    {
      id: "l2-q4",
      grammarId: 3,
      grammarPattern: "〜って (3)",
      direction: "jp-to-vi",
      question: "彼は来月から日本に留学するってみんなに言っていた。",
      questionRuby: "彼[かれ]は来月[らいげつ]から日本[にほん]に留学[りゅうがく]するってみんなに言[い]っていた。",
      audioText: "彼は来月から日本に留学するってみんなに言っていた。",
      options: [
        "Nghe nói mọi người đều khuyên anh ấy sang Nhật du học.",
        "Việc đi du học Nhật tháng sau đúng là phong cách của anh ấy.",
        "Anh ấy đang tập trung học tiếng Nhật để chuẩn bị du học.",
        "Anh ấy đã nói với mọi người rằng từ tháng sau sẽ đi du học Nhật Bản."
      ],
      correctIndex: 3,
      explanation: "「Mệnh đề + って言う」thay cho 「～と言う」trong văn nói (nói rằng...)."
    },
    {
      id: "l2-q5",
      grammarId: 4,
      grammarPattern: "〜って (4) / という",
      direction: "jp-to-vi",
      question: "これはフォーという料理で、ベトナムではとても有名です。",
      questionRuby: "これはフォーという料理[りょうり]で、ベトナムではとても有名[ゆうめい]です。",
      audioText: "これはフォーという料理で、ベトナムではとても有名です。",
      options: [
        "Đây là món ăn gọi là Phở, ở Việt Nam rất nổi tiếng.",
        "Nghe nói món Phở ở Việt Nam rất khó nấu.",
        "Món Phở này được nấu lấy thịt bò làm trọng tâm.",
        "Món ăn này mang hương vị đậm chất Việt Nam."
      ],
      correctIndex: 0,
      explanation: "「N1 + という + N2」dùng để giới thiệu hoặc gọi tên sự vật cụ thể (N2 gọi là N1)."
    },
    {
      id: "l2-q6",
      grammarId: 5,
      grammarPattern: "〜らしい",
      direction: "jp-to-vi",
      question: "息子は高校生になり、だんだん大人らしい顔になってきた。",
      questionRuby: "息子[むすこ]は高校生[こうこうせい]になり、だんだん大人[おとな]らしい顔[かお]になってきた。",
      audioText: "息子は高校生になり、だんだん大人らしい顔になってきた。",
      options: [
        "Nghe nói con trai tôi sắp lên cấp 3 như người lớn.",
        "Con trai đã lên cấp 3 nên khuôn mặt dần ra dáng người lớn.",
        "Con trai tôi nói với người lớn rằng mình đã lên cấp 3.",
        "Ở trường cấp 3, con trai tôi học tập trung vào môn này."
      ],
      correctIndex: 1,
      explanation: "「N + らしい」diễn tả tính chất điển hình, ra dáng hoặc đậm chất của danh từ đó."
    },
    {
      id: "l2-q7",
      grammarId: 6,
      grammarPattern: "〜を中心",
      direction: "jp-to-vi",
      question: "この教室では、会話を中心に勉強している。",
      questionRuby: "この教室[きょうしつ]では、会話[かいわ]を中心[ちゅうしん]に勉強[べんきょう]している。",
      audioText: "この教室では、会話を中心に勉強している。",
      options: [
        "Nghe nói lớp học này chỉ toàn học viên giỏi hội thoại.",
        "Hội thoại ở lớp học này rất giống cách nói của người bản xứ.",
        "Ở lớp học này, chúng tôi học tập trung chủ yếu vào hội thoại.",
        "Lớp học này có tên là lớp hội thoại."
      ],
      correctIndex: 2,
      explanation: "「Nを中心に」diễn tả việc lấy N làm trung tâm, chủ yếu hoặc trọng tâm."
    },
    {
      id: "l2-q8",
      grammarId: 1,
      grammarPattern: "〜って (1)",
      direction: "vi-to-jp",
      question: "Tiếng Nhật thì làm thế nào để trở nên giỏi hơn?",
      audioText: "日本語ってどうすれば上手になりますか。",
      options: [
        "日本語ってどうすれば上手になりますか。",
        "日本語らしいどうすれば上手になりますか。",
        "日本語を中心にどうすれば上手になりますか。",
        "日本語という国はどうすれば上手になりますか。"
      ],
      optionsRuby: [
        "日本語[にほんご]ってどうすれば上手[じょうず]になりますか。",
        "日本語[にほんご]らしいどうすれば上手[じょうず]になりますか。",
        "日本語[にほんご]を中心[ちゅうしん]にどうすれば上手[じょうず]になりますか。",
        "日本語[にほんご]という国[くに]はどうすれば上手[じょうず]になりますか。"
      ],
      correctIndex: 0,
      explanation: "「N + って」đặt sau danh từ để nêu chủ đề câu trong hội thoại thân mật."
    },
    {
      id: "l2-q9",
      grammarId: 2,
      grammarPattern: "〜って (2)",
      direction: "vi-to-jp",
      question: "Thấy bảo hôm nay anh ấy đi muộn nên bị thầy mắng đấy.",
      audioText: "彼は今日、遅刻して先生におこられたって。",
      options: [
        "彼は今日、遅刻して先生におこられたらしい顔だ。",
        "彼は今日、遅刻して先生におこられたって。",
        "彼は今日、遅刻したという先生におこられた。",
        "彼は今日、遅刻を中心に先生におこられた。"
      ],
      optionsRuby: [
        "彼[かれ]は今日[きょう]、遅刻[ちこく]して先生[せんせい]におこられたらしい顔[かお]だ。",
        "彼[かれ]は今日[きょう]、遅刻[ちこく]して先生[せんせい]におこられたって。",
        "彼[かれ]は今日[きょう]、遅刻[ちこく]したという先生[せんせい]におこられた。",
        "彼[かれ]は今日[きょう]、遅刻[ちこく]を中心[ちゅうしん]に先生[せんせい]におこられた。"
      ],
      correctIndex: 1,
      explanation: "Trích dẫn thông tin nghe được ở cuối câu văn nói:「V(普) + って」."
    },
    {
      id: "l2-q10",
      grammarId: 3,
      grammarPattern: "〜って (3)",
      direction: "vi-to-jp",
      question: "Lần đầu tiên nói chuyện với anh ấy, tôi đã nghĩ anh ấy là người tốt.",
      audioText: "彼と初めて話したけど、いい人だなって思った。",
      options: [
        "彼と初めて話したけど、いい人を中心にしたと思った。",
        "彼と初めて話したけど、いい人らしいと思った。",
        "彼と初めて話したけど、いい人だなって思った。",
        "彼と初めて話したけど、いい人という名前だと思った。"
      ],
      optionsRuby: [
        "彼[かれ]と初[はじ]めて話[はな]したけど、いい人[ひと]を中心[ちゅうしん]にしたと思[おも]った。",
        "彼[かれ]と初[はじ]めて話[はな]したけど、いい人[ひと]らしいと思[おも]った。",
        "彼[かれ]と初[はじ]めて話[はな]したけど、いい人[ひと]だなって思[おも]った。",
        "彼[かれ]と初[はじ]めて話[はな]したけど、いい人[ひと]という名前[なまえ]だと思[おも]った。"
      ],
      correctIndex: 2,
      explanation: "「Mệnh đề (thể ngắn) + って思う」thay cho 「～と思う」trong văn nói."
    },
    {
      id: "l2-q11",
      grammarId: 4,
      grammarPattern: "〜って (4) / という",
      direction: "vi-to-jp",
      question: "Tôi đến từ đất nước gọi là Nhật Bản.",
      audioText: "私は日本という国から来ました。",
      options: [
        "私は日本らしい国から来ました。",
        "私は日本を中心に国から来ました。",
        "私は日本だって国から来ました。",
        "私は日本という国から来ました。"
      ],
      optionsRuby: [
        "私[わたし]は日本[にほん]らしい国[くに]から来[き]ました。",
        "私[わたし]は日本[にほん]を中心[ちゅうしん]に国[くに]から来[き]ました。",
        "私[わたし]は日本[にほん]だって国[くに]から来[き]ました。",
        "私[わたし]は日本[にほん]という国[くに]から来[き]ました。"
      ],
      correctIndex: 3,
      explanation: "Giới thiệu tên riêng đứng trước danh từ loại rộng hơn ->「N1 + という + N2」."
    },
    {
      id: "l2-q12",
      grammarId: 5,
      grammarPattern: "〜らしい",
      direction: "vi-to-jp",
      question: "Hôm nay là một ngày đúng kiểu mùa hè nhỉ!",
      audioText: "今日は夏らしい日ですね。",
      options: [
        "今日は夏らしい日ですね。",
        "今日は夏という日ですね。",
        "今日は夏を中心に日ですね。",
        "今日は夏だって日ですね。"
      ],
      optionsRuby: [
        "今日[きょう]は夏[なつ]らしい日[ひ]ですね。",
        "今日[きょう]は夏[なつ]という日[ひ]ですね。",
        "今日[きょう]は夏[なつ]を中心[ちゅうしん]に日[ひ]ですね。",
        "今日[きょう]は夏[なつ]だって日[ひ]ですね。"
      ],
      correctIndex: 0,
      explanation: "Mang đặc điểm tiêu biểu của mùa hè ->「N1 + らしい + N2」."
    },
    {
      id: "l2-q13",
      grammarId: 6,
      grammarPattern: "〜を中心",
      direction: "vi-to-jp",
      question: "Tôi đang thực hiện chế độ ăn kiêng lấy ăn uống làm trọng tâm.",
      audioText: "食事を中心としたダイエットをしている。",
      options: [
        "食事ってダイエットをしている。",
        "食事を中心としたダイエットをしている。",
        "食事らしいダイエットをしている。",
        "食事というダイエットをしている。"
      ],
      optionsRuby: [
        "食事[しょくじ]ってダイエットをしている。",
        "食事[しょくじ]を中心[ちゅうしん]としたダイエットをしている。",
        "食事[しょくじ]らしいダイエットをしている。",
        "食事[しょくじ]というダイエットをしている。"
      ],
      correctIndex: 1,
      explanation: "Bổ nghĩa cho danh từ phía sau với nghĩa lấy N1 làm trọng tâm ->「N1 + を中心とした + N2」."
    }
  ]
};

export const ALL_LESSON_GRAMMAR: Record<string, LessonGrammar> = {
  "lesson-1": LESSON_1_GRAMMAR,
  "lesson-2": LESSON_2_GRAMMAR,
  "lesson-3": LESSON_2_GRAMMAR,
};
