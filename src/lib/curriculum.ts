export type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type ScriptureSlide = {
  reference: string
  text: string
}

export type Lesson = {
  id: string
  title: string
  description: string
  slides: ScriptureSlide[]
}

export type Chapter = {
  id: string
  number: number
  title: string
  description: string
  emoji: string
  lessons: Lesson[]
}

export type LevelData = {
  label: string
  subtitle: string
  emoji: string
  chapters: Chapter[]
}

export const CURRICULUM: Record<Level, LevelData> = {
  BEGINNER: {
    label: 'Foundation',
    subtitle: 'For New Believers',
    emoji: '🌱',
    chapters: [
      {
        id: 'b-ch1', number: 1, title: 'Salvation', emoji: '✝️',
        description: "Understanding God's rescue plan and how to receive eternal life through Jesus Christ",
        lessons: [{
          id: 'b-l1', title: "What is Salvation?",
          description: "Salvation is God's rescue plan for humanity. Through Jesus Christ, God bridges the gap between us and Him caused by sin. This lesson walks you through the foundational scriptures that explain what salvation means and how to receive it. If you've recently given your life to Christ, these verses will anchor your new life in Him.",
          slides: [
            { reference: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
            { reference: 'Romans 3:23', text: 'For all have sinned and fall short of the glory of God.' },
            { reference: 'Romans 6:23', text: 'For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord.' },
            { reference: 'Romans 10:9', text: 'If you declare with your mouth, "Jesus is Lord," and believe in your heart that God raised him from the dead, you will be saved.' },
            { reference: 'Ephesians 2:8-9', text: 'For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God — not by works, so that no one can boast.' },
          ]
        }]
      },
      {
        id: 'b-ch2', number: 2, title: 'Who is God?', emoji: '👑',
        description: "Discovering the nature, character, and unconditional love of God the Father",
        lessons: [{
          id: 'b-l2', title: "The Nature of God",
          description: "God is not a distant or uncaring creator. He is personal, loving, all-knowing, and ever-present. Many new believers struggle with their image of God — shaped by people or religion rather than the Bible. In this lesson, discover the foundational truths about who God truly is and why it changes everything.",
          slides: [
            { reference: 'Genesis 1:1', text: 'In the beginning God created the heavens and the earth.' },
            { reference: '1 John 4:8', text: 'Whoever does not love does not know God, because God is love.' },
            { reference: 'Psalm 139:7-8', text: 'Where can I go from your Spirit? Where can I flee from your presence? If I go up to the heavens, you are there; if I make my bed in the depths, you are there.' },
            { reference: 'Isaiah 40:28', text: 'Do you not know? Have you not heard? The Lord is the everlasting God, the Creator of the ends of the earth. He will not grow tired or weary, and his understanding no one can fathom.' },
            { reference: 'Jeremiah 29:11', text: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."' },
          ]
        }]
      },
      {
        id: 'b-ch3', number: 3, title: 'The Holy Trinity', emoji: '🕊️',
        description: "One God in three persons — Father, Son, and Holy Spirit revealed in Scripture",
        lessons: [{
          id: 'b-l3', title: "Father, Son & Holy Spirit",
          description: "The Trinity is one of the most profound and beautiful mysteries of the Christian faith. God is one God who exists in three distinct persons, each fully God. This lesson introduces you to the relational nature of God and how each person of the Trinity works in your daily life.",
          slides: [
            { reference: 'Matthew 28:19', text: '"Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit."' },
            { reference: 'Matthew 3:16-17', text: 'As soon as Jesus was baptized, he went up out of the water. At that moment heaven was opened, and he saw the Spirit of God descending like a dove. And a voice from heaven said, "This is my Son, whom I love; with him I am well pleased."' },
            { reference: '2 Corinthians 13:14', text: 'May the grace of the Lord Jesus Christ, and the love of God, and the fellowship of the Holy Spirit be with you all.' },
            { reference: 'John 14:26', text: '"But the Advocate, the Holy Spirit, whom the Father will send in my name, will teach you all things and will remind you of everything I have said to you."' },
            { reference: 'John 10:30', text: '"I and the Father are one."' },
          ]
        }]
      },
      {
        id: 'b-ch4', number: 4, title: "God's Word — The Bible", emoji: '📖',
        description: "Why Scripture is the living foundation of a strong and fruitful Christian life",
        lessons: [{
          id: 'b-l4', title: "The Living Word",
          description: "The Bible is not just an ordinary book — it is God's living Word, breathed out by His Spirit through human authors. It is your guide, your comfort, and your spiritual food. Many Christians struggle because they don't read the Bible daily. This lesson shows you what the Bible says about itself and why it must be central to your life.",
          slides: [
            { reference: '2 Timothy 3:16', text: 'All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.' },
            { reference: 'Psalm 119:105', text: 'Your word is a lamp for my feet, a light on my path.' },
            { reference: 'Hebrews 4:12', text: 'For the word of God is alive and active. Sharper than any double-edged sword, it penetrates even to dividing soul and spirit, joints and marrow; it judges the thoughts and attitudes of the heart.' },
            { reference: 'Isaiah 40:8', text: 'The grass withers and the flowers fall, but the word of our God endures forever.' },
            { reference: 'Joshua 1:8', text: '"Keep this Book of the Law always on your lips; meditate on it day and night, so that you may be careful to do everything written in it. Then you will be prosperous and successful."' },
          ]
        }]
      },
      {
        id: 'b-ch5', number: 5, title: 'Prayer', emoji: '🙏',
        description: "Learning to talk with God and experience the power of a life in communication with Him",
        lessons: [{
          id: 'b-l5', title: "Talking with God",
          description: "Prayer is simply talking to God. It doesn't need to be formal or complicated. God invites you to bring everything to Him — your fears, your gratitude, your needs, your praise. Many new believers feel unsure how to pray. This lesson removes the mystery and teaches you the privilege and practice of prayer.",
          slides: [
            { reference: 'Matthew 6:9-10', text: '"This, then, is how you should pray: Our Father in heaven, hallowed be your name, your kingdom come, your will be done, on earth as it is in heaven."' },
            { reference: 'Philippians 4:6-7', text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.' },
            { reference: '1 Thessalonians 5:17', text: 'Pray continually.' },
            { reference: 'James 5:16', text: 'The prayer of a righteous person is powerful and effective.' },
            { reference: 'Jeremiah 33:3', text: '"Call to me and I will answer you and tell you great and unsearchable things you do not know."' },
          ]
        }]
      },
      {
        id: 'b-ch6', number: 6, title: 'The Church', emoji: '⛪',
        description: "You are part of the Body of Christ — discovering your place in the global family of believers",
        lessons: [{
          id: 'b-l6', title: "The Body of Christ",
          description: "The Church is not a building — it's people. When you gave your life to Christ, you became part of the global family of believers called the Body of Christ. Many new believers underestimate how essential community is to their spiritual growth. This lesson helps you understand your place in the Body.",
          slides: [
            { reference: 'Acts 2:42', text: 'They devoted themselves to the apostles\' teaching and to fellowship, to the breaking of bread and to prayer.' },
            { reference: 'Hebrews 10:24-25', text: 'And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together, as some are in the habit of doing, but encouraging one another — and all the more as you see the Day approaching.' },
            { reference: '1 Corinthians 12:27', text: 'Now you are the body of Christ, and each one of you is a part of it.' },
            { reference: 'Matthew 18:20', text: '"For where two or three gather in my name, there am I with them."' },
            { reference: 'Romans 12:4-5', text: 'For just as each of us has one body with many members, and these members do not all have the same function, so in Christ we, though many, form one body, and each member belongs to all the others.' },
          ]
        }]
      },
      {
        id: 'b-ch7', number: 7, title: 'Baptism', emoji: '💧',
        description: "The public, outward declaration of your inward transformation in Christ",
        lessons: [{
          id: 'b-l7', title: "What is Baptism?",
          description: "Baptism is not what saves you — salvation comes by faith alone in Christ. But baptism is a vital step of obedience and public declaration of your new life. It is a powerful spiritual act that symbolises dying to your old self and rising to new life in Christ. If you haven't been baptised, this lesson will help you understand why it matters.",
          slides: [
            { reference: 'Matthew 28:19', text: '"Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit."' },
            { reference: 'Romans 6:4', text: 'We were therefore buried with him through baptism into death in order that, just as Christ was raised from the dead through the glory of the Father, we too may live a new life.' },
            { reference: 'Acts 2:38', text: 'Peter replied, "Repent and be baptized, every one of you, in the name of Jesus Christ for the forgiveness of your sins. And you will receive the gift of the Holy Spirit."' },
            { reference: 'Galatians 3:27', text: 'For all of you who were baptized into Christ have clothed yourselves with Christ.' },
            { reference: 'Colossians 2:12', text: 'Having been buried with him in baptism, in which you were also raised with him through your faith in the working of God, who raised him from the dead.' },
          ]
        }]
      },
      {
        id: 'b-ch8', number: 8, title: 'Identity in Christ', emoji: '🔑',
        description: "Who you truly are now that you belong to Jesus — your new name, your new nature",
        lessons: [{
          id: 'b-l8', title: "Your New Identity",
          description: "Everything changed when you gave your life to Christ. You are no longer defined by your past, your failures, your family background, or what others say about you. You have a completely new identity — one rooted entirely in what God says you are. This might be the most important lesson for any new believer.",
          slides: [
            { reference: '2 Corinthians 5:17', text: 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!' },
            { reference: 'John 1:12', text: 'Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God.' },
            { reference: 'Ephesians 2:10', text: 'For we are God\'s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.' },
            { reference: 'Romans 8:1', text: 'Therefore, there is now no condemnation for those who are in Christ Jesus.' },
            { reference: '1 John 3:1', text: 'See what great love the Father has lavished on us, that we should be called children of God! And that is what we are!' },
          ]
        }]
      },
    ]
  },

  INTERMEDIATE: {
    label: 'Growing Deeper',
    subtitle: 'Developing Your Walk',
    emoji: '🌿',
    chapters: [
      {
        id: 'i-ch1', number: 1, title: 'Living by Faith', emoji: '⚓',
        description: "Moving from head knowledge to an active, daily, life-transforming trust in God",
        lessons: [{
          id: 'i-l1', title: "Faith in Action",
          description: "Faith is not passive. True faith transforms how you live, how you make decisions, and how you face challenges. After the foundations of salvation and identity, you must learn to walk by faith — not by feelings, not by circumstances. This lesson explores what it means to live a life fully surrendered to God.",
          slides: [
            { reference: 'Hebrews 11:1', text: 'Now faith is confidence in what we hope for and assurance about what we do not see.' },
            { reference: 'Romans 10:17', text: 'Consequently, faith comes from hearing the message, and the message is heard through the word about Christ.' },
            { reference: 'James 2:17', text: 'In the same way, faith by itself, if it is not accompanied by action, is dead.' },
            { reference: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
            { reference: '2 Corinthians 5:7', text: 'For we live by faith, not by sight.' },
          ]
        }]
      },
      {
        id: 'i-ch2', number: 2, title: 'Worship', emoji: '🎶',
        description: "Giving God the honour, praise, and devotion He deserves — beyond Sunday services",
        lessons: [{
          id: 'i-l2', title: "A Life of Worship",
          description: "Worship is far more than singing songs on Sunday. It is a posture of your whole life — offering everything you are to God in response to who He is. This lesson explores what true worship looks like in the Bible and how to cultivate a lifestyle of worship in your everyday life.",
          slides: [
            { reference: 'John 4:23-24', text: '"Yet a time is coming and has now come when the true worshipers will worship the Father in the Spirit and in truth, for they are the kind of worshipers the Father seeks. God is spirit, and his worshipers must worship in the Spirit and in truth."' },
            { reference: 'Romans 12:1', text: 'Therefore, I urge you, brothers and sisters, in view of God\'s mercy, to offer your bodies as a living sacrifice, holy and pleasing to God — this is your true and proper worship.' },
            { reference: 'Psalm 95:6', text: 'Come, let us bow down in worship, let us kneel before the Lord our Maker.' },
            { reference: 'Colossians 3:17', text: 'And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus, giving thanks to God the Father through him.' },
            { reference: 'Psalm 150:6', text: 'Let everything that has breath praise the Lord. Praise the Lord.' },
          ]
        }]
      },
      {
        id: 'i-ch3', number: 3, title: 'Spiritual Disciplines', emoji: '⚡',
        description: "Fasting, solitude, and spiritual practices that carve out space for God to move",
        lessons: [{
          id: 'i-l3', title: "The Power of Fasting",
          description: "Fasting is one of the most powerful yet misunderstood spiritual disciplines. When you fast, you deny your physical appetite to create space for deeper prayer and intimacy with God. Every major figure in Scripture fasted — Moses, David, Esther, Jesus, Paul. This lesson teaches you the purpose and practice of fasting.",
          slides: [
            { reference: 'Matthew 6:16-17', text: '"When you fast, do not look somber as the hypocrites do, for they disfigure their faces to show others they are fasting. But when you fast, put oil on your head and wash your face, so that it will not be obvious to others that you are fasting, but only to your Father, who is unseen."' },
            { reference: 'Isaiah 58:6', text: '"Is not this the kind of fasting I have chosen: to loose the chains of injustice and untie the cords of the yoke, to set the oppressed free and break every yoke?"' },
            { reference: 'Acts 13:2-3', text: 'While they were worshiping the Lord and fasting, the Holy Spirit said, "Set apart for me Barnabas and Saul for the work to which I have called them." So after they had fasted and prayed, they placed their hands on them and sent them off.' },
            { reference: 'Joel 2:12', text: '"Even now," declares the Lord, "return to me with all your heart, with fasting and weeping and mourning."' },
            { reference: 'Matthew 4:2', text: 'After fasting forty days and forty nights, he was hungry. The tempter came to him — but Jesus stood firm in the Word.' },
          ]
        }]
      },
      {
        id: 'i-ch4', number: 4, title: 'Spiritual Warfare', emoji: '⚔️',
        description: "Understanding the real battle and putting on the full armour of God every day",
        lessons: [{
          id: 'i-l4', title: "The Full Armour of God",
          description: "As a Christian, you are in a spiritual battle. The enemy is real — but so is your victory. God has given you everything you need to stand firm and advance His Kingdom. This lesson walks you through the armour of God and how to use it practically in your daily life and spiritual battles.",
          slides: [
            { reference: 'Ephesians 6:10-11', text: 'Finally, be strong in the Lord and in his mighty power. Put on the full armor of God, so that you can take your stand against the devil\'s schemes.' },
            { reference: 'Ephesians 6:12', text: 'For our struggle is not against flesh and blood, but against the rulers, against the authorities, against the powers of this dark world and against the spiritual forces of evil in the heavenly realms.' },
            { reference: '2 Corinthians 10:4', text: 'The weapons we fight with are not the weapons of the world. On the contrary, they have divine power to demolish strongholds.' },
            { reference: '1 Peter 5:8-9', text: 'Be alert and of sober mind. Your enemy the devil prowls around like a roaring lion looking for someone to devour. Resist him, standing firm in the faith.' },
            { reference: 'James 4:7', text: 'Submit yourselves, then, to God. Resist the devil, and he will flee from you.' },
          ]
        }]
      },
      {
        id: 'i-ch5', number: 5, title: 'Grace & Forgiveness', emoji: '🕊️',
        description: "Receiving God's grace fully and learning to extend it freely to others",
        lessons: [{
          id: 'i-l5', title: "Living in Grace",
          description: "Grace is God giving you what you could never earn or deserve. It is the heartbeat of Christianity — and the hardest thing for many people to fully receive. But grace isn't just something you receive; it's something you live and give. This lesson explores what radical grace looks like in your relationships.",
          slides: [
            { reference: 'Romans 6:14', text: 'For sin shall no longer be your master, because you are not under the law, but under grace.' },
            { reference: 'Titus 2:11-12', text: 'For the grace of God has appeared that offers salvation to all people. It teaches us to say "No" to ungodliness and worldly passions, and to live self-controlled, upright and godly lives in this present age.' },
            { reference: 'Matthew 18:21-22', text: 'Then Peter came to Jesus and asked, "Lord, how many times shall I forgive my brother or sister who sins against me? Up to seven times?" Jesus answered, "I tell you, not seven times, but seventy-seven times."' },
            { reference: 'Colossians 3:13', text: 'Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.' },
            { reference: 'Romans 5:8', text: 'But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.' },
          ]
        }]
      },
      {
        id: 'i-ch6', number: 6, title: 'Serving Others', emoji: '🤲',
        description: "Following Jesus\' example of servant leadership in every area of your life",
        lessons: [{
          id: 'i-l6', title: "The Heart of a Servant",
          description: "Jesus said that greatness in God's Kingdom looks radically different from greatness in the world. In the Kingdom, the greatest is the one who serves. This lesson explores how to cultivate a genuine servant's heart — not out of obligation, but out of overflow of what God has done for you.",
          slides: [
            { reference: 'Mark 10:45', text: '"For even the Son of Man did not come to be served, but to serve, and to give his life as a ransom for many."' },
            { reference: 'Galatians 5:13', text: 'You, my brothers and sisters, were called to be free. But do not use your freedom to indulge the flesh; rather, serve one another humbly in love.' },
            { reference: '1 Peter 4:10', text: 'Each of you should use whatever gift you have received to serve others, as faithful stewards of God\'s grace in its various forms.' },
            { reference: 'Philippians 2:3-4', text: 'Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves, not looking to your own interests but each of you to the interests of the others.' },
            { reference: 'Matthew 25:40', text: '"Truly I tell you, whatever you did for one of the least of these brothers and sisters of mine, you did for me."' },
          ]
        }]
      },
      {
        id: 'i-ch7', number: 7, title: 'Evangelism', emoji: '🌍',
        description: "Sharing your faith boldly, naturally, and effectively with those around you",
        lessons: [{
          id: 'i-l7', title: "Sharing the Good News",
          description: "Every believer is called to share the Gospel — not just pastors. You don't need a theology degree. You just need your story and a willingness to point people to Jesus. This lesson removes the fear and equips you with the confidence and framework to share your faith naturally in everyday life.",
          slides: [
            { reference: 'Romans 1:16', text: 'For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes: first to the Jew, then to the Gentile.' },
            { reference: 'Mark 16:15', text: 'He said to them, "Go into all the world and preach the gospel to all creation."' },
            { reference: 'Acts 1:8', text: '"But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth."' },
            { reference: '1 Peter 3:15', text: 'Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have. But do this with gentleness and respect.' },
            { reference: 'Matthew 28:19-20', text: '"Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age."' },
          ]
        }]
      },
      {
        id: 'i-ch8', number: 8, title: 'Discipleship', emoji: '🔥',
        description: "Making disciples who make disciples — multiplying the Kingdom of God",
        lessons: [{
          id: 'i-l8', title: "Making Disciples",
          description: "Jesus' last command was to make disciples — not just converts. Discipleship is walking with someone on their journey with God, just as someone walked with you. This lesson teaches you what genuine discipleship looks like and gives you the tools to invest in someone else's spiritual growth.",
          slides: [
            { reference: 'Matthew 28:19-20', text: '"Go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age."' },
            { reference: 'Luke 9:23', text: '"Whoever wants to be my disciple must deny themselves and take up their cross daily and follow me."' },
            { reference: 'John 15:5', text: '"I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me you can do nothing."' },
            { reference: '2 Timothy 2:2', text: 'And the things you have heard me say in the presence of many witnesses entrust to reliable people who will also be qualified to teach others.' },
            { reference: 'Colossians 1:28', text: 'He is the one we proclaim, admonishing and teaching everyone with all wisdom, so that we may present everyone fully mature in Christ.' },
          ]
        }]
      },
    ]
  },

  ADVANCED: {
    label: 'Maturity & Impact',
    subtitle: 'Deep Roots, Wide Reach',
    emoji: '🌳',
    chapters: [
      {
        id: 'a-ch1', number: 1, title: 'The Holy Spirit', emoji: '🔥',
        description: "Walking in the fullness of the Spirit's power, gifts, and daily guidance",
        lessons: [{
          id: 'a-l1', title: "Filled with the Spirit",
          description: "The Holy Spirit is not a distant force — He lives in you. He is your counselor, guide, teacher, and empowerer. Many believers live far below what the Spirit has made available to them. This lesson explores what it means to be continually filled with the Spirit and to walk in His fullness daily.",
          slides: [
            { reference: 'John 14:16-17', text: '"I will ask the Father, and he will give you another advocate to help you and be with you forever — the Spirit of truth. The world cannot accept him, because it neither sees him nor knows him. But you know him, for he lives with you and will be in you."' },
            { reference: 'Acts 1:8', text: '"But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth."' },
            { reference: 'Galatians 5:22-23', text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control. Against such things there is no law.' },
            { reference: 'Ephesians 5:18', text: 'Do not get drunk on wine, which leads to debauchery. Instead, be filled with the Spirit.' },
            { reference: 'Romans 8:11', text: 'And if the Spirit of him who raised Jesus from the dead is living in you, he who raised Christ from the dead will also give life to your mortal bodies because of his Spirit who lives in you.' },
          ]
        }]
      },
      {
        id: 'a-ch2', number: 2, title: 'Purpose & Calling', emoji: '🎯',
        description: "Discovering and courageously walking in your God-given assignment on the earth",
        lessons: [{
          id: 'a-l2', title: "Your God-Given Purpose",
          description: "You were not an accident. Before you were born, God had a plan for your life — a specific calling, a unique assignment, a part only you can play in His story. This lesson helps you explore what purpose looks like in the Kingdom and how to align your life with the work God prepared for you.",
          slides: [
            { reference: 'Jeremiah 1:5', text: '"Before I formed you in the womb I knew you, before you were born I set you apart; I appointed you as a prophet to the nations."' },
            { reference: 'Ephesians 2:10', text: 'For we are God\'s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.' },
            { reference: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
            { reference: 'Psalm 139:13-14', text: 'For you created my inmost being; you knit me together in my mother\'s womb. I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.' },
            { reference: '1 Corinthians 12:4-5', text: 'There are different kinds of gifts, but the same Spirit distributes them. There are different kinds of service, but the same Lord.' },
          ]
        }]
      },
      {
        id: 'a-ch3', number: 3, title: 'Marriage & Relationships', emoji: '💍',
        description: "Building godly relationships rooted in covenant love and God's design",
        lessons: [{
          id: 'a-l3', title: "Covenant Love",
          description: "God designed relationships for our flourishing — and He has clear wisdom on how they should work. Whether in marriage, family, or friendship, the way we relate to others reflects the character of God to the world. This lesson explores biblical principles for building strong, life-giving, God-honouring relationships.",
          slides: [
            { reference: 'Genesis 2:24', text: '"That is why a man leaves his father and mother and is united to his wife, and they become one flesh."' },
            { reference: 'Ephesians 5:25', text: 'Husbands, love your wives, just as Christ loved the church and gave himself up for her.' },
            { reference: '1 Corinthians 13:4-5', text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.' },
            { reference: 'Proverbs 18:22', text: 'He who finds a wife finds what is good and receives favor from the Lord.' },
            { reference: 'Ruth 1:16', text: '"Where you go I will go, and where you stay I will stay. Your people will be my people and your God my God."' },
          ]
        }]
      },
      {
        id: 'a-ch4', number: 4, title: 'Stewardship & Generosity', emoji: '🌾',
        description: "Honouring God with your time, talents, and treasure as a faithful steward",
        lessons: [{
          id: 'a-l4', title: "Everything Belongs to God",
          description: "Everything you have — your time, money, gifts, and opportunities — belongs to God. You are a steward, not an owner. Many Christians experience financial pressure and scarcity because they haven't discovered the Kingdom principle of generosity. This lesson teaches you the biblical principles of stewardship and how generous living unlocks blessing.",
          slides: [
            { reference: 'Malachi 3:10', text: '"Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this," says the Lord Almighty, "and see if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it."' },
            { reference: 'Luke 16:10', text: '"Whoever can be trusted with very little can also be trusted with much, and whoever is dishonest with very little will also be dishonest with much."' },
            { reference: '2 Corinthians 9:7', text: 'Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.' },
            { reference: 'Proverbs 11:24-25', text: 'One person gives freely, yet gains even more; another withholds unduly, but comes to poverty. A generous person will prosper; whoever refreshes others will be refreshed.' },
            { reference: 'Matthew 6:21', text: '"For where your treasure is, there your heart will be also."' },
          ]
        }]
      },
    ]
  }
}

export const LEVEL_ORDER: Level[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

export function getAllLessons() {
  const lessons: Array<{ lesson: Lesson; chapter: Chapter; level: Level }> = []
  for (const level of LEVEL_ORDER) {
    for (const chapter of CURRICULUM[level].chapters) {
      for (const lesson of chapter.lessons) {
        lessons.push({ lesson, chapter, level })
      }
    }
  }
  return lessons
}

export function getTotalLessons() {
  return getAllLessons().length
}

export function isChapterUnlocked(chapterIdx: number, levelIdx: number, completedIds: Set<string>): boolean {
  if (levelIdx === 0 && chapterIdx === 0) return true

  // All previous chapters in this level must be complete
  const level = LEVEL_ORDER[levelIdx]
  const chapters = CURRICULUM[level].chapters
  for (let c = 0; c < chapterIdx; c++) {
    for (const lesson of chapters[c].lessons) {
      if (!completedIds.has(lesson.id)) return false
    }
  }

  // All chapters in previous levels must be complete
  for (let l = 0; l < levelIdx; l++) {
    const prevLevel = LEVEL_ORDER[l]
    for (const chapter of CURRICULUM[prevLevel].chapters) {
      for (const lesson of chapter.lessons) {
        if (!completedIds.has(lesson.id)) return false
      }
    }
  }
  return true
}

export function isLevelUnlocked(levelIdx: number, completedIds: Set<string>): boolean {
  if (levelIdx === 0) return true
  for (let l = 0; l < levelIdx; l++) {
    const prevLevel = LEVEL_ORDER[l]
    for (const chapter of CURRICULUM[prevLevel].chapters) {
      for (const lesson of chapter.lessons) {
        if (!completedIds.has(lesson.id)) return false
      }
    }
  }
  return true
}
