"use client";

import { JobListProvider } from "./JobListContext";
import { JobSeekerProvider } from "./JobSeekerContext";
import { NoticeProvider } from "./NoticeContext";
import { RewardProvider } from "./RewardContext";
import { ZikrProvider } from "./ZikrContext";
import { TasbihUserProvider } from "./TasbihUserContext";
import { AllMasjidProvider } from "./AllMasjidContext";
import { LocalStoreProvider } from "./LocalStoreContext";
import { FreeServiceProvider } from "./FreeServiceContext";
import { QuranProvider } from "./QuranContext";
import { PrayerTimeProvider } from "./PrayerTimeContext";
import { JamatTimeProvider } from "./JamatTimeContext";
import { AuthProvider } from "./AuthContext";
import { MasjidCommitteeProvider } from "./MasjidCommitteeContext";
import { MasjidCommitteeEventProvider } from "./MasjidCommitteeEventContext";
import { KanzulProvider } from "./KanzulContext";
import { PdfProxyProvider } from "./PdfProxyContext";

export default function AppProviders({ children }) {
    return (
        <AuthProvider>
            <AllMasjidProvider>
                <JobListProvider>
                    <JobSeekerProvider>
                        <NoticeProvider>
                            <RewardProvider>
                                <ZikrProvider>
                                    <TasbihUserProvider>
                                        <LocalStoreProvider>
                                            <FreeServiceProvider>
                                                <QuranProvider>
                                                    <PrayerTimeProvider>
                                                        <JamatTimeProvider>
                                                            <MasjidCommitteeProvider>
                                                                <MasjidCommitteeEventProvider>
                                                                    <KanzulProvider>
                                                                        <PdfProxyProvider>
                                                                            {children}
                                                                        </PdfProxyProvider>
                                                                    </KanzulProvider>
                                                                </MasjidCommitteeEventProvider>
                                                            </MasjidCommitteeProvider>
                                                        </JamatTimeProvider>
                                                    </PrayerTimeProvider>
                                                </QuranProvider>
                                            </FreeServiceProvider>
                                        </LocalStoreProvider>
                                    </TasbihUserProvider>
                                </ZikrProvider>
                            </RewardProvider>
                        </NoticeProvider>
                    </JobSeekerProvider>
                </JobListProvider>
            </AllMasjidProvider>
        </AuthProvider>
    );
}
