"use client";

import { useCallback, useEffect, useState } from "react";
import { employeeService } from "@/services/employee-service";
import { recognitionClient, rewardsClient } from "@/services/api-clients";
import { extractErrorMessage } from "@/lib/error-utils";
import type { PaginatedReviewResponse, ReviewResponse } from "@/types/review";
import type { HistoryItem, PaginatedHistoryResponse } from "@/types/history-types";
import type {
    EmployeeDetail,
    ProfileActivityItem,
    ProfileMetrics,
} from "@/types/profile-types";

const FETCH_BATCH_SIZE = 100;

interface UseProfileDataResult {
    profile: EmployeeDetail | null;
    metrics: ProfileMetrics;
    activities: ProfileActivityItem[];
    loading: boolean;
    error: string | null;
    retry: () => Promise<void>;
}

const EMPTY_METRICS: ProfileMetrics = {
    recognitions_received: 0,
    recognitions_given: 0,
    rewards_redeemed: 0,
};

function buildRecognitionActivity(
    review: ReviewResponse,
    employeeId: string
): ProfileActivityItem {
    const received = review.receiver_id === employeeId;
    const pointsText =
        typeof review.raw_points === "number" ? `${review.raw_points} points` : "recognition";
    const comment = review.comment?.trim();

    return {
        id: review.review_id,
        type: received ? "recognition_received" : "recognition_sent",
        title: received ? "Recognition received" : "Recognition sent",
        description: comment ? `${pointsText} - ${comment}` : pointsText,
        occurred_at: review.review_at,
        points: review.raw_points,
    };
}

function buildRewardActivity(item: HistoryItem): ProfileActivityItem {
    const rewardName = item.reward_catalog?.reward_name ?? "Reward redeemed";

    return {
        id: item.history_id,
        type: "reward_redeemed",
        title: "Reward redeemed",
        description: `${rewardName} - ${item.points.toLocaleString()} points`,
        occurred_at: item.granted_at,
        points: item.points,
    };
}

async function fetchAllReviews(): Promise<ReviewResponse[]> {
    const allReviews: ReviewResponse[] = [];
    let page = 1;

    while (true) {
        const res = await recognitionClient.get<PaginatedReviewResponse>(
            `/reviews?page=${page}&page_size=${FETCH_BATCH_SIZE}`
        );
        const { data, pagination } = res.data;

        allReviews.push(...(data || []));

        if (!pagination?.has_next || data.length === 0) {
            break;
        }

        page += 1;
    }

    return allReviews;
}

async function fetchAllRewardHistory(): Promise<HistoryItem[]> {
    const allHistory: HistoryItem[] = [];
    let page = 1;
    let totalItems = 0;

    do {
        const res = await rewardsClient.get<PaginatedHistoryResponse>(
            `/history/me?page=${page}&size=${FETCH_BATCH_SIZE}`
        );
        const pageItems = res.data.data || [];

        totalItems = res.data.total_items || 0;
        allHistory.push(...pageItems);
        page += 1;

        if (pageItems.length === 0) {
            break;
        }
    } while (allHistory.length < totalItems);

    return allHistory;
}

export function useProfileData(employeeId?: string): UseProfileDataResult {
    const [profile, setProfile] = useState<EmployeeDetail | null>(null);
    const [metrics, setMetrics] = useState<ProfileMetrics>(EMPTY_METRICS);
    const [activities, setActivities] = useState<ProfileActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfileData = useCallback(async () => {
        if (!employeeId) {
            setProfile(null);
            setMetrics(EMPTY_METRICS);
            setActivities([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [employee, reviews, rewardHistory] = await Promise.all([
                employeeService.getEmployee(employeeId),
                fetchAllReviews(),
                fetchAllRewardHistory(),
            ]);

            const normalizedProfile: EmployeeDetail = {
                ...employee,
                roles: employee.roles || [],
            } as EmployeeDetail;

            const recognitionsReceived = reviews.filter((review) => review.receiver_id === employeeId);
            const recognitionsGiven = reviews.filter((review) => review.reviewer_id === employeeId);
            const rewardsRedeemed = rewardHistory.filter((item) => !!item.reward_catalog);

            const mergedActivities = [
                ...recognitionsReceived.map((review) => buildRecognitionActivity(review, employeeId)),
                ...recognitionsGiven.map((review) => buildRecognitionActivity(review, employeeId)),
                ...rewardsRedeemed.map(buildRewardActivity),
            ]
                .sort(
                    (a, b) =>
                        new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
                )
                .slice(0, 5);

            setProfile(normalizedProfile);
            setMetrics({
                recognitions_received: recognitionsReceived.length,
                recognitions_given: recognitionsGiven.length,
                rewards_redeemed: rewardsRedeemed.length,
            });
            setActivities(mergedActivities);
        } catch (err: unknown) {
            setError(extractErrorMessage(err, "Something went wrong"));
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    return {
        profile,
        metrics,
        activities,
        loading,
        error,
        retry: fetchProfileData,
    };
}
