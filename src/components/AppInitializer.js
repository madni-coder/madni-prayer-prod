"use client";
import { useEffect } from "react";
import { useJobListContext } from "../context/JobListContext";
import { useJobSeekerContext } from "../context/JobSeekerContext";
import { useNoticeContext } from "../context/NoticeContext";
import { useRewardContext } from "../context/RewardContext";
import { useZikrContext } from "../context/ZikrContext";
import { useTasbihUserContext } from "../context/TasbihUserContext";
import { useAllMasjidContext } from "../context/AllMasjidContext";
import { useLocalStoreContext } from "../context/LocalStoreContext";
import { useFreeServiceContext } from "../context/FreeServiceContext";
import { useQuranContext } from "../context/QuranContext";
import { usePrayerTimeContext } from "../context/PrayerTimeContext";
import { useKanzulContext } from "../context/KanzulContext";

export default function AppInitializer({ children }) {
    const { fetchAll: fetchJobLists } = useJobListContext();
    const { fetchAll: fetchJobSeekers } = useJobSeekerContext();
    const { fetchAll: fetchNotices } = useNoticeContext();
    const { fetchAll: fetchRewards } = useRewardContext();
    const { fetchAll: fetchZikrs } = useZikrContext();
    const { fetchAll: fetchTasbihUsers } = useTasbihUserContext();
    const { fetchAll: fetchAllMasjids } = useAllMasjidContext();
    const { fetchAll: fetchLocalStores } = useLocalStoreContext();
    const { fetchAll: fetchFreeServices } = useFreeServiceContext();
    const { fetchAll: fetchQuran } = useQuranContext();
    const { fetchTimes: fetchPrayerTimes } = usePrayerTimeContext();
    const { fetchPdf: fetchKanzul } = useKanzulContext();

    useEffect(() => {
        // Fire all APIs on mount without awaiting so they execute in background
        fetchJobLists?.();
        fetchJobSeekers?.();
        fetchNotices?.();
        fetchRewards?.();
        fetchZikrs?.();
        fetchTasbihUsers?.();
        fetchAllMasjids?.();
        fetchLocalStores?.();
        fetchFreeServices?.();
        fetchQuran?.();
        fetchPrayerTimes?.();
        fetchKanzul?.();
    }, [
        fetchJobLists,
        fetchJobSeekers,
        fetchNotices,
        fetchRewards,
        fetchZikrs,
        fetchTasbihUsers,
        fetchAllMasjids,
        fetchLocalStores,
        fetchFreeServices,
        fetchQuran,
        fetchPrayerTimes,
        fetchKanzul,
    ]);

    return <>{children}</>;
}
