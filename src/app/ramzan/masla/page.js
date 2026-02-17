"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FaAngleLeft } from 'react-icons/fa'
import { useState } from "react"

export default function MaslaPage() {
    const router = useRouter()

    const masail = [
        { id: 1, title: "मसअला : (1)", content: "हालते रोज़ा में मंजन, कोलगेट, गुल वग़ैरा करने से जबतक यक़ीन हो कि उसका कोई जुज़ हल्क में न जाएगा तो रोज़ा नहीं टूटेगा मगर बिला ज़रूरते सहीहा मकरूह है, और अगर उसके अजज़ा हल्क से उतर गए तो रोज़ा फासिद हो जाएगा।", hawaaala: "(तहकीकी फतावी)" },
        { id: 2, title: "मसअला : (2)", content: "रोज़े के लिये नीयत ज़रूरी है, अगर कोई शख्स बग़ैर नीयत के सारा दिन भूका प्यासा रहा और जिमा से बचा, फिर भी उसका रोज़ा न होगा।", hawaaala: "(बहारे शरीअत जिल्द अव्वल, रद्दुलमुख्तार जिल्द द्वूम।)" },
        { id: 3, title: "मसअला : (3)", content: "हालते रोज़ा में मिस्वाक करने में हर्ज़ नहीं, उस से रोज़ा नहीं टूटता, चाहे खुश्क हो या तर सुबह करे या शाम।", hawaaala: "(फतावा हिन्दिय्या)" },
        { id: 4, title: "मसअला : (4)", content: "रोज़ा की हालत में बांस और अनार की लकड़ी के अलावा हर कड़वी लकड़ी की ही मिस्वाक करना बेहतर है।", hawaaala: "(रद्दुलमुख़तार जिल्द अव्वल)" },
        { id: 5, title: "मसअला : (5)", content: "रोज़ा की हालत में इंजेक्शन लगवाने से रोज़ा नहीं टूटता, चाहे रग में लगवाए या गोश्त में।", hawaaala: "(फतावा फयज़ुर रसूल)" },
        { id: 6, title: "मसअला: 6", content: "रोज़ा की हालत में टेस्ट के लिये ख़ून निकलवाना जाइज़ है, इस से रोज़ा नहीं टूटता।", hawaaala: "(आम कुतुबे फिक़्ह)" },
        { id: 7, title: "मसअला: 7", content: "रोज़े की हालत में किसी ज़रूरतमंद मरीज़ को ख़ून देना बिला करा हाइत जाइज़ है, इस से रोज़ा नहीं टूटेगा। नोट: अलबत्ता इतना ख़ून न निकाला जाए कि रोज़े की इस्तेतात बाक़ी न रहे", hawaaala: "(फ़ैज़ाने फ़र्ज़ उ़लूम)" },
        { id: 8, title: "मसअला: 8", content: "अगर कमज़ोरी का ख़ौफ़ न हो तो सींगी (हिजामा)लगवाने में कोई हरज नहीं और अगर कमज़ोरी का ख़ौफ़ हो तो उसको चाहिए कि ग़ुरूब-ए-आफ़ताब तक मुअख्खर करे।", hawaaala: "(फतावा-ए-आलमगीरी)" },
        { id: 9, title: "मसअला: 9", content: "रोज़े के लिये सेहरी ज़रूरी नहीं, हाँ सुन्नत ज़रूर है, लिहाज़ा जानबूझ कर इस अज़ीम सुन्नत को न छोड़ा जाए।", hawaaala: "(बहारे शरीअत जिल्द अव्वल)" },
        { id: 10, title: "मसअला: 10", content: "रोज़े की हालत में ऑक्सीजन मास्क लगाने से रोज़ा टूट जाता है।", hawaaala: "(फै़जाने फर्ज उ़लूम)" },
        { id: 11, title: "मसअला: 11", content: "रोज़े की हालत में इन्हेलर का इस्तेमाल करने से रोज़ा टूट जाता है, क्योंके इन्हेलर में दवाई के ज़र्रात होते हैं जिसके ज़रिए मरीज़ के फेफड़ों के अंदर दवा पहुँचाई जाती है जिस की वजह से वो मरीज़ आसानी से साँस लेना शुरू कर देता है।", hawaaala: "(फतावा-ए-अहले सुन्नत)" },
        { id: 12, title: "मसअला: 12", content: "रोज़े की हालत में अगर क़सदन धुआँ हलक तक पहुँच गया तो रोज़ा फ़ासिद हो गया, जब के रोज़ेदार होना याद हो। और हुक़्क़ा पीने से भी रोज़ा टूट जाता है, अगर रोज़ेदार होना याद हो और हुक़्क़ा पीने वाले पर कफ़्फ़ारा भी लाज़िम आएगा।", hawaaala: "(दुर्र-ए-मुख़्तार रद्दुल-मुहतार जिल्द दोम)" },
        { id: 13, title: "मसअला: 13", content: "अगरबत्ती सुलग रही थी किसी ने मुँह को क़रीब करके धुएँ को नाक से खींचा तो रोज़ा जाता रहा।", hawaaala: "(बहारे शरीअत जिल्द अव्वल)" },
        { id: 14, title: "मसअला। 14", content: "रोज़े की हा़लत में आंखों में सुर्मा लगा सकते हैं, इस से रोज़ा नहीं टूटेगा अगरचे सुरमे का मज़ा ह़ल्क़ में महसूस होता हो बल्के थूक में सुर्मे का रंग भी दिखाई देता हो।", hawaaala: "(बहारे शरीअत जिल्दअव्वल)" },
        { id: 15, title: "मसअला: 15", content: "वुज़ू करते वक़्त पानी नाक में डाला और पानी दिमाग़ तक चढ़ गया या हलक के नीचे उतर गया और रोज़ेदार होना याद था तो रोज़ा टूट गया और क़ज़ा लाज़िम है। और अगर उस वक़्त रोज़ेदार होना याद नहीं था तो रोज़ा न गया।", hawaaala: "(बहारे शरीअत जिल्द अव्वल)" },
        { id: 16, title: "मसअला। 16", content: "रोजे की हालत में हैज़ या निफास शुरू हो गया तो रोज़ा जाता रहा, पाकी के बाद उसकी क़जा रखे, फ़र्ज़ था तो क़जा फ़र्ज़ है और निफास था तो क़जा वाजिब है।", hawaaala: "(बहारे शरीअत जिल्दअव्वल)" },
        { id: 17, title: "मसअला। 17", content: "रमज़ान शरीफ़ में वित्र की जमाअत फ़र्ज़ की जमाअत के ताबे है लिहा़ज़ा अगर इमाम के साथ फ़र्ज़ नमाज़ अदा न की हो तो वित्र में भी इमाम की इक़तदा नहीं करेगा।", hawaaala: "(रद्दुलमुख़तार, फतावा तातारख़ानिया)" },
        { id: 18, title: "मसअला। 18", content: "रोजे में कोई शख्स शहवत के साथ बोसा ले और इन्ज़ाल हो जाए तो रोजा़ फा़सिद हो जाएगा, और अगर इन्ज़ाल न हो तो रोज़ा फासिद नहीं होगा, अलबत्ता अय्याम-ए-रमज़ान में ये फ़ेअल मकरूह है।", hawaaala: "(हिलाया अव्वलैन)" },
        { id: 19, title: "मसअला। 19", content: "नापाकी की हालत में रोज़ा हो जाएगा, हाँ सुबह सादिक़ होने से पहले गु़स्ल कर लेना बेहतर है। और इतनी देर जनाबत की हालत में रहना के नमाज़ का वक़्त निकल जाए और नमाज़ क़जा़ हो जाए बहुत बड़ा गुनाह और हराम है।", hawaaala: "(तह़क़ीक़ी फ़तावा)" },
        { id: 20, title: "मसअला। 20", content: "रोज़े दारों के लिए बिना किसी उज़र के कोई चीज चखना या चबाना मकरूह है।", hawaaala: "(तह़क़ीक़ी फ़तावा)" },
        { id: 21, title: "मसअला। 21", content: "रोज़े की हालत में बदन में तेल लगाने से रोज़ा नहीं टूटता।", hawaaala: "(फ़तावा हिंदिया)" },
        { id: 22, title: "मसअला। 22", content: "दूध पिलाने वाली या ह़ामिला  औरत को अगर रोज़ा रखने के सबब अपनी या बच्चे की जान को नुकसान पहुँचने या सख्त परेशानी में मुब्तिला हो जाने का सह़ी अंदेशा हो तो रोज़ा न रखने की इजाज़त है, लेकिन बाद में उन रोज़ों की कज़ा फ़र्ज़ है।", hawaaala: "(तह़क़ीक़ी फ़तावा)" },
        { id: 23, title: "मसअला। 23", content: "रोज़ा याद होने के बावजूद जानबूझकर मुंह भर के़ (उल्टी ) की और उस क़े में  खाना, पानी, कड़वा पानी, या खून आए तो रोज़ा टूट जाएगा।  और बिना इख़्तियार के़ हुई और वह मुंह भर है और उसमें से एक चने के बराबर वापस लौटा दी तो भी रोज़ा टूट जाएगा।", hawaaala: "(फतवा-ए-आलमगीरी, सहारे शरीअ़त)" },
        { id: 24, title: "मसअला। 24", content: "रोज़े की हालत में झूठ, गी़बत, चुग़ली, बद निगाही, दाढ़ी मुंड़ाना ,बिला इजाज़ते शरई किसी का दिल दुखाना और गाली देना अगरचे यह ह़राम हैं मगर रोज़ा नहीं टूटता, हां मकरूह हो जाता है और रोज़े की नूरानियत चली जाती है।", hawaaala: "(बहारे शरीअत)" },
        { id: 25, title: "मसअला। 25", content: "रोज़े की हालत में नाक में दवा चढ़ाने से रोज़ा टूट जाता है۔", hawaaala: "(दुर्रे मुख़्तार)" },
        { id: 26, title: "मसअला。 26", content: "रोज़े़ की हालत में आंख में दवा डालने से रोज़ा नहीं टूटता है。", hawaaala: "(तह़क़ीक़े सह़ीह़)" },
        { id: 27, title: "मसअला。 27", content: "अगर मुश्तज़नी से इंज़ाल (मनी) हो जाए तो रोज़ा टूट जाता है । फ़ायदा: रोज़े की हा़लत में एह़तलाम होने से रोज़ा नहीं टूटा।", hawaaala: "(दुर्रे मुख़्तार, रद्दुलमुख़तार)" },
        { id: 28, title: "मसअला। 28", content: "इसतह़ाज़ा : यानी बीमारी का खून रोज़े के मुनाफी नहीं और ना इस हालत में रोज़ा माफ़ होता है लिहा़ज़ा रोज़े की हा़लत में इसतह़ाज़ा के खून से रोज़ा नहीं टूटता औरत रोज़े को मुकम्मल करेगी।", hawaaala: "(फ़तावा आ़लमगीरी)" },
        { id: 29, title: "मसअला। 29", content: "रोज़े की हालत में एह़तलाम हो जाने से रोज़ा नहीं टूटता।", hawaaala: "( दुर्रेमुख्तार)" },
        { id: 30, title: "मसअला। 30", content: "थूक और बलग़म जब तक मुंह में हो उनको निगलने से रोज़ा नहीं टूटता, अलबत्ता मुंह से बाहर मसलन हथेली पर थूक कर फिर मुंह में दोबारा डाला तो रोज़ा टूट जाएगा और ऐसा आम तौर पर कोई नहीं करता।", hawaaala: "(दुर्रेमुख्तार मअ रद्दुलमुख़तार)" },
        { id: 31, title: "मसअला। 31", content: "इत्तर वगैरा लगाने से रोज़ा नहीं टूटता।", hawaaala: "(आ़म कुतुबे फिक़्ह)" },
        { id: 32, title: "मसअला। 32", content: "रोज़े की हालत में बवासीर या क़ब्ज के मरीज के लिए एनिमा से रोजा टूट जाएगा क्योंकि एनिमा में मक़्अ़द यानी पाख़ाना के मका़म में दवा चढ़ाई जाती है जो ह़ुक़ना की जदीद सूरत है।", hawaaala: "(मुही़ते बुरहानी)" },
        { id: 33, title: "मसअला। 33", content: "रोज़े की हालत में दिल के मरीज़ का जु़बान के नीचे टिकिया रखना रोजे़ को तोड़ देगा क्योंकि उ़मूमन वो गोली थूक में शामिल होकर ह़लक़ से नीचे उतर जाती है। नोट : अगर बिल्फर्ज़ गोली का असर ह़लक़ से नीचे ना उतरे तो रोज़ा नहीं टूटेगा मगर ऐसा बहुत मुश्किल है लिहाजा़ ह़त्तल इमकान गुरेज़ किया जाए", hawaaala: "(माहनामा अशरफिया)" },
        { id: 34, title: "मसअला। 34", content: "अगर शुगर का मरीज़ रोजे़ की हालत में इंजेक्शन के ज़रिए इंसुलिन गोश्त में ले तो रोज़ा नहीं टूटता।", hawaaala: "(दारुल इफ्ता अहले सुन्नत)" }
    ]

    // Pagination state (10 entries per page)
    const entriesPerPage = 10
    const [currentPage, setCurrentPage] = useState(1)
    const totalPages = Math.ceil(masail.length / entriesPerPage)
    const paginatedMasail = masail.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                
                <button
                    className="flex items-center gap-2 mb-4 text-lg text-primary hover:text-green-600 font-semibold"
                    onClick={() => router.push("/ramzan")}
                    aria-label="Back to Ramzan"
                >
                    <FaAngleLeft /> Back
                </button>

                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
                        मसा़इल — Ramzan
                    </h1>
                </div>

                <div id="roze-sections" className="space-y-6">
                    {paginatedMasail.map((m) => (
                        <div key={m.id} className="rounded-lg bg-card text-card-foreground shadow-sm">
                            <div className="p-6">
                                <h3 className="text-xl md:text-2xl font-semibold text-primary mb-3">{m.title}</h3>
                                <p className="text-white font-bold leading-relaxed mb-3">{m.content}</p>
                                <p className="text-sm text-destructive italic">{m.hawaaala}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="my-8" />

                {/* Pagination controls */}
                <div className="flex items-center justify-center gap-2">
                    <button
                        className="px-3 py-1 rounded-md bg-card border border-transparent text-card-foreground hover:bg-primary/10 disabled:opacity-50"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                    >
                        Prev
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                        const page = i + 1
                        const isActive = page === currentPage
                        return (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded-md border ${isActive ? 'bg-primary text-white font-semibold' : 'bg-card text-card-foreground hover:bg-primary/5'}`}
                                aria-current={isActive ? 'page' : undefined}
                                aria-label={`Page ${page}`}
                            >
                                {page}
                            </button>
                        )
                    })}

                    <button
                        className="px-3 py-1 rounded-md bg-card border border-transparent text-card-foreground hover:bg-primary/10 disabled:opacity-50"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}
