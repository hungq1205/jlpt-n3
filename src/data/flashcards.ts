export interface Flashcard {
  id: number;
  kanji: string;
  kana: string;
  viet: string;
  vietnamese?: string; // backwards compatibility
  hanViet: string;
  example: string;
  exampleKana?: string;
  exampleViet: string;
}

export const DATA: Flashcard[] = [
  { "id": 1, "kanji": "次回", "kana": "じかい", "viet": "lần sau, lần tiếp theo", "hanViet": "THỨ HỒI", "example": "次回は気をつけます。", "exampleKana": "じかいはきをつけます。", "exampleViet": "Lần sau tôi sẽ chú ý hơn." },
  { "id": 2, "kanji": "原因", "kana": "げんいん", "viet": "nguyên nhân, lý do", "hanViet": "NGUYÊN NHÂN", "example": "失敗の原因を調べる。", "exampleKana": "しっぱいのげんいんをしらべる。", "exampleViet": "Tìm hiểu nguyên nhân thất bại." },
  { "id": 3, "kanji": "習慣", "kana": "しゅうかん", "viet": "thói quen, tập quán", "hanViet": "TẬP QUÁN", "example": "この仕事を始めてから、早起きの習慣が身に付いた。", "exampleKana": "このしごとをはじめてから、はやおきのしゅうかんがみについた。", "exampleViet": "Kể từ khi bắt đầu công việc này, tôi đã hình thành thói quen dậy sớm." },
  { "id": 4, "kanji": "最後", "kana": "さいご", "viet": "cuối cùng, lần cuối", "hanViet": "TỐI HẬU", "example": "アルバイト最後の日に、パーティーを開いてもらった。", "exampleKana": "アルバイトさいごのひに、パーティーをひらいてもらった。", "exampleViet": "Tôi đã được mọi người tổ chức cho một buổi party vào ngày đi làm thêm cuối cùng." },
  { "id": 5, "kanji": "最終", "kana": "さいしゅう", "viet": "sau cùng, cuối cùng (giai đoạn)", "hanViet": "TỐI CHUNG", "example": "最終電車は11時58分です。", "exampleKana": "さいしゅうでんしゃは11じ58ふんです。", "exampleViet": "Chuyến tàu cuối xuất phát lúc 11:58." },
  { "id": 6, "kanji": "最初", "kana": "さいしょ", "viet": "đầu tiên, ban đầu, lúc đầu", "hanViet": "TỐI SƠ", "example": "最初は漢字が全然読めなかったけど、今は読める。", "exampleKana": "さいしょはかんじがぜんぜんよめなかったけど、いまはよめる。", "exampleViet": "Ban đầu tôi hoàn toàn không đọc được chữ Hán, nhưng bây giờ tôi đã đọc được rồi." },
  { "id": 7, "kanji": "最新", "kana": "さいしん", "viet": "mới nhất, hiện đại nhất", "hanViet": "TỐI TÂN", "example": "このデータは、今年最新のデータです。", "exampleKana": "このデータは、ことしさいしんのデータです。", "exampleViet": "Dữ liệu này là dữ liệu mới nhất của năm nay." },
  { "id": 8, "kanji": "最多", "kana": "さいた", "viet": "nhiều nhất (số lượng)", "hanViet": "TỐI ĐA", "example": "今年は台風の数がこの5年で最多だった。", "exampleKana": "ことしはたいふうのかずがこの5ねんでさいただた。", "exampleViet": "Năm nay là năm có số lượng bão nhiều nhất trong vòng 5 năm gần đây." },
  { "id": 9, "kanji": "最大", "kana": "さいだい", "viet": "lớn nhất, cực đại, tối đa", "hanViet": "TỐI ĐA", "example": "この会場は最大で1万人入ります。", "exampleKana": "このかいじょうはさいだいで1まんにんはいります。", "exampleViet": "Hội trường này có thể chứa tối đa 10.000 người." },
  { "id": 10, "kanji": "最中", "kana": "さいちゅう", "viet": "đang trong lúc, giữa chừng", "hanViet": "TỐI TRUNG", "example": "試合の最中に地震が起きた。", "exampleKana": "しあいのさいちゅうにじしんがおきた。", "exampleViet": "Động đất đã xảy ra ngay trong lúc trận đấu đang diễn ra." },
  { "id": 11, "kanji": "感情", "kana": "かんじょう", "viet": "cảm xúc, tình cảm", "hanViet": "CẢM TÌNH", "example": "私は感情が表に出やすい。", "exampleKana": "わたしはかんじょうがおもてにでやすい。", "exampleViet": "Tôi dễ để lộ cảm xúc ra bên ngoài." },
  { "id": 12, "kanji": "事情", "kana": "じじょう", "viet": "sự tình, hoàn cảnh, lý do", "hanViet": "SỰ TÌNH", "example": "彼は中国に住んでいたから、中国の事情に詳しい。", "exampleKana": "かれはちゅうごくにすんでいたから、ちゅうごくのじじょうにくわしい。", "exampleViet": "Vì từng sống ở Trung Quốc nên anh ấy rất am hiểu tình hình ở Trung Quốc." },
  { "id": 13, "kanji": "情報", "kana": "じょうほう", "viet": "thông tin", "hanViet": "TÌNH BÁO", "example": "事件の情報を集める。", "exampleKana": "じけんのじょうほうをあつめる。", "exampleViet": "Thu thập thông tin về vụ việc." },
  { "id": 14, "kanji": "表情", "kana": "ひょうじょう", "viet": "biểu cảm, nét mặt", "hanViet": "BIỂU TÌNH", "example": "彼女は表情がよく変わる。", "exampleKana": "かのじょはひょうじょうがよくかわる。", "exampleViet": "Biểu cảm của cô ấy rất hay thay đổi." },
  { "id": 15, "kanji": "友情", "kana": "ゆうじょう", "viet": "tình bạn", "hanViet": "HỮU TÌNH", "example": "私たちは友情を大切にしている。", "exampleKana": "わたしたちはゆうじょうをたいせつにしている。", "exampleViet": "Chúng tôi luôn trân trọng tình bạn." },
  { "id": 16, "kanji": "調子", "kana": "ちょうし", "viet": "tình trạng, trạng thái (cơ thể, máy móc, công việc...)", "hanViet": "ĐIỀU TỪ", "example": "最近、体の調子がいい。", "exampleKana": "さいきん、からだのちょうしがいい。", "exampleViet": "Gần đây sức khỏe của tôi rất tốt." },
  { "id": 17, "kanji": "熱", "kana": "ねつ", "viet": "sốt; nhiệt, sức nóng", "hanViet": "NHIỆT", "example": "40度の熱が出て、会社を休んだ。", "exampleKana": "40どのねつがでて、かいしゃをやすんだ。", "exampleViet": "Tôi bị sốt 40 độ nên đã nghỉ làm." },
  { "id": 18, "kanji": "急ぎ", "kana": "いそぎ", "viet": "khẩn cấp, vội vàng, gấp rút", "hanViet": "CẤP", "example": "課長から急ぎの仕事を頼まれた。", "exampleKana": "かちょうからいそぎのしごとをたのまれた。", "exampleViet": "Tôi được trưởng phòng nhờ việc gấp." },
  { "id": 19, "kanji": "性格", "kana": "せいかく", "viet": "tính cách", "hanViet": "TÍNH CÁCH", "example": "前の彼氏とは、性格が合わなくて別れた。", "exampleKana": "まえのかれしとは、せいかくがあわなくてわかれた。", "exampleViet": "Tôi đã chia tay với bạn trai cũ vì không hợp tính cách." },
  { "id": 20, "kanji": "始め", "kana": "はじめ", "viet": "lúc bắt đầu, lúc khởi đầu", "hanViet": "THỦY", "example": "授業の始めに単語テストをする。", "exampleKana": "じゅぎょうのはじめにたんごテストをする。", "exampleViet": "Làm bài kiểm tra từ vựng vào đầu giờ học." },
  { "id": 21, "kanji": "始まり", "kana": "はじまり", "viet": "sự khởi đầu, sự bắt đầu", "hanViet": "THỦY", "example": "雨の影響で試合の始まりが遅れた。", "exampleKana": "あめのえいきょうでしあいのはじまりがおくれた。", "exampleViet": "Trận đấu bắt đầu muộn do ảnh hưởng của mưa." },
  { "id": 22, "kanji": "将来", "kana": "しょうらい", "viet": "tương lai", "hanViet": "TƯƠNG LAI", "example": "社長は会社の将来を考えている。", "exampleKana": "しゃちょうはかいしゃのしょうらいをかんがえている。", "exampleViet": "Giám đốc đang suy nghĩ về tương lai của công ty." },
  { "id": 23, "kanji": "給料", "kana": "きゅうりょう", "viet": "tiền lương", "hanViet": "CẤP LIỆU", "example": "給料が少ないので、違う仕事がしたい。", "exampleKana": "きゅうりょうがすくないので、ちがうしごとがしたい。", "exampleViet": "Vì lương thấp nên tôi muốn làm công việc khác." },
  { "id": 24, "kanji": "暮らし", "kana": "くらし", "viet": "cuộc sống", "hanViet": "MỘ", "example": "日本の暮らしに少しずつ慣れてきました。", "exampleKana": "にほんのくらしにすこしずつなれてきました。", "exampleViet": "Tôi đã dần quen với cuộc sống ở Nhật." },
  { "id": 25, "kanji": "壁", "kana": "かべ", "viet": "bức tường", "hanViet": "BÍCH", "example": "部屋の壁に写真を飾った。", "exampleKana": "へやのかべにしゃしんをかざった。", "exampleViet": "Tôi đã trang trí ảnh lên tường của phòng." },
  { "id": 26, "kanji": "機械", "kana": "きかい", "viet": "máy móc", "hanViet": "CƠ GIỚI", "example": "この機械の使い方を教えていただけませんか。", "exampleKana": "このきかいのつかいかたをおしえていただけませんか。", "exampleViet": "Bạn có thể chỉ cho tôi cách dùng cái máy này không?" },
  { "id": 27, "kanji": "電球", "kana": "でんきゅう", "viet": "bóng đèn tròn", "hanViet": "ĐIỆN CẦU", "example": "あれ？電気がつかない。電球が切れたのかな。", "exampleKana": "あれ？でんきがつかない。でんきゅうがきれたのかな。", "exampleViet": "Ơ? Đèn không sáng. Không biết có phải đèn bị cháy rồi không." },
  { "id": 28, "kanji": "前日", "kana": "ぜんじつ", "viet": "ngày hôm trước", "hanViet": "TIỀN NHẬT", "example": "旅行の前日は、わくわくして眠れなかった。", "exampleKana": "りょこうのぜんじつは、わくわくしてねむれなかった。", "exampleViet": "Trước ngày đi du lịch tôi háo hức đến mức chẳng ngủ được." },
  { "id": 29, "kanji": "全力", "kana": "ぜんりょく", "viet": "toàn lực, hết sức", "hanViet": "TOÀN LỰC", "example": "駅まで全力で走って、ぎりぎり電車に間に合った。", "exampleKana": "えきまでぜんりょくではしって、ぎりぎりでんしゃにまにあった。", "exampleViet": "Tôi đã chạy hết sức đến ga và kịp lên tàu vào phút chót." },
  { "id": 30, "kanji": "悲しみ", "kana": "かなしみ", "viet": "nỗi buồn", "hanViet": "BI", "example": "彼女と別れた悲しみで、勉強する気分になれない。", "exampleKana": "かのじょとわかれたかなしみで、べんきょうするきぶんになれない。", "exampleViet": "Buồn vì chia tay với cô ấy nên tôi không có tâm trạng học." }
];
