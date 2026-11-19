// Every prayer page, used by the Prayers page cards and by each prayer page's "Next prayer" button.
// Listed in Most Common order. priority ranks them by how often you'll use them; why is shown in Most Common view, d in A–Z view.
// rosary marks a prayer of the Rosary: order is the order to learn it in (the order it first comes in the Rosary), where is
// when it's said; the Rosary pages are built from these, and Prayers cards add "also included in the Rosary". href is relative to the site root; key matches the page's localStorage prefix, so the Prayers and Rosary pages can show saved progress.
window.PRAYERS=[
 {href:"prayers/our-father.html",key:"paf",rosary:{order:2,where:"On each large bead, before each decade"},priority:1,why:"Said at every Mass",emblem:"paternoster",title:"The Our Father",latin:"Pater Noster",d:"The prayer Jesus taught us"},
 {href:"prayers/hail-mary.html",key:"hmy",rosary:{order:3,where:"Three to open, then ten in each decade"},priority:2,why:"The most-prayed Marian prayer",emblem:"lily",title:"Hail Mary",latin:"Ave Maria",d:"The angel’s greeting and the Church’s plea"},
 {href:"prayers/glory-be.html",key:"glb",rosary:{order:4,where:"After the opening Hail Marys and after each decade"},priority:3,why:"Ends many prayers, and every psalm in the Liturgy of the Hours",emblem:"glory",title:"Glory Be",latin:"Gloria Patri",d:"Praise to the Trinity"},
 {href:"prayers/act-of-contrition.html",key:"aoc",priority:4,why:"Required in Confession",emblem:"keys",title:"Act of Contrition",latin:"Actus Contritionis",d:"Sorrow for sin and the resolve to change"},
 {href:"prayers/fatima-prayer.html",key:"fat",rosary:{order:5,where:"After the Glory Be, at the end of each decade"},priority:5,why:"A short plea for mercy for ourselves and all souls",emblem:"fatima",title:"The Fatima Prayer",latin:"O mi Iesu",d:"Taught by Our Lady at Fatima"},
 {href:"prayers/apostles-creed.html",key:"apc",rosary:{order:1,where:"On the crucifix, to open the Rosary"},priority:6,why:"The Church’s ancient baptismal creed",emblem:"apostles",title:"The Apostles’ Creed",latin:"Symbolum Apostolorum",d:"The faith of the Apostles"},
 {href:"prayers/nicene-creed.html",key:"nic",priority:7,why:"Said at every Sunday Mass, but it’s the longest, so learn it after the shorter prayers",emblem:"nicene",title:"The Nicene Creed",latin:"Symbolum Nicænum",d:"The creed professed at Sunday Mass"},
 {href:"prayers/hail-holy-queen.html",key:"hhq",rosary:{order:6,where:"Once, after the fifth decade"},priority:8,why:"Sung at Night Prayer for much of the year",emblem:"marian",title:"Hail, Holy Queen",latin:"Salve Regina",d:"An ancient Marian antiphon"},
 {href:"prayers/memorare.html",key:"mem",priority:9,why:"A traditional devotion, not part of the Mass",emblem:"rose",title:"The Memorare",latin:"Memorare",d:"A prayer of confident trust in Mary"},
 {href:"prayers/st-michael.html",key:"stm",priority:10,why:"Said after Mass in many parishes",emblem:"sword",title:"Prayer to Saint Michael",latin:"Sancte Michael",d:"A plea to the archangel for protection from evil"}
];
// A card's description: the given text plus the Rosary note where it applies. Also used as the prayer page's header line.
window.prayerNote=(p,text)=>text+(p.rosary?"; also included in the Rosary":"");
