module.exports = {
  cacheTtlMs: 10 * 60 * 1000,
  defaultTopic: "equestrian",
  feedsByTopic: {
    equestrian: [
      {
        name: "Horse & Hound (Showing)",
        url: "https://www.horseandhound.co.uk/showing/feed",
      },
      {
        name: "Horse & Hound (News)",
        url: "https://www.horseandhound.co.uk/news/feed",
      },
      {
        name: "Horse & Hound (Features)",
        url: "https://www.horseandhound.co.uk/features/feed",
      },
      {
        name: "Horse & Hound (Blog)",
        url: "https://www.horseandhound.co.uk/blog/feed",
      },
      {
        name: "Western Life Today",
        url: "https://www.westernlifetoday.com/feed/",
      },
      {
        name: "The Horse",
        url: "https://thehorse.com/feed/",
      },
      {
        name: "Horse Network",
        url: "https://horsenetwork.com/feed/",
      },
    ],
    offroad: [
      {
        name: "Off Road Xtreme",
        url: "https://www.offroadxtreme.com/feed/",
      },
      {
        name: "Jeepfan",
        url: "https://jeepfan.com/feed/",
      },
      {
        name: "Overland Expo (Compass / News & Industry)",
        url: "https://www.overlandexpo.com/compass/category/news-industry/feed/",
      },
    ],
  },
};

