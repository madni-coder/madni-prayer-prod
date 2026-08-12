"use client";

import AppInitializer from "../components/AppInitializer";
import { JobListProvider } from "./JobListContext";
import { JobSeekerProvider } from "./JobSeekerContext";
import { NoticeProvider } from "./NoticeContext";
import { RewardProvider } from "./RewardContext";
import { ZikrProvider } from "./ZikrContext";
import { TasbihUserProvider } from "./TasbihUserContext";
import { AllMasjidProvider } from "./AllMasjidContext";
import { LocalStoreProvider } from "./LocalStoreContext";
import { QuranProvider } from "./QuranContext";
import { PrayerTimeProvider } from "./PrayerTimeContext";
import { JamatTimeProvider } from "./JamatTimeContext";
import { AuthProvider } from "./AuthContext";
import { MasjidCommitteeProvider } from "./MasjidCommitteeContext";
import { MasjidCommitteeEventProvider } from "./MasjidCommitteeEventContext";
import { KanzulProvider } from "./KanzulContext";
import { PdfProxyProvider } from "./PdfProxyContext";
import { PushNotificationProvider } from "./PushNotificationContext";

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
                                            <QuranProvider>
                                                <PrayerTimeProvider>
                                                    <JamatTimeProvider>
                                                        <MasjidCommitteeProvider>
                                                            <MasjidCommitteeEventProvider>
                                                                <KanzulProvider>
                                                                    <PdfProxyProvider>
                                                                        <PushNotificationProvider>
                                                                            <AppInitializer>
                                                                                {children}
                                                                            </AppInitializer>
                                                                        </PushNotificationProvider>
                                                                    </PdfProxyProvider>
                                                                </KanzulProvider>
                                                            </MasjidCommitteeEventProvider>
                                                        </MasjidCommitteeProvider>
                                                    </JamatTimeProvider>
                                                </PrayerTimeProvider>
                                            </QuranProvider>
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
