"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Sparkles, AlertCircle, Edit, Trash2, Plus, Clock, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function Testimonials({
  initialReviews = [],
  initialTotal = 0,
  initialAverage = 0,
  initialHasMore = false,
  isAuthenticated = false,
  currentUserReview = null,
  onUnauthAction,
}) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState(initialReviews);
  const [totalReviews, setTotalReviews] = useState(initialTotal);
  const [averageRating, setAverageRating] = useState(initialAverage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [isLoading, setIsLoading] = useState(false);

  // Review Form States
  const [userReview, setUserReview] = useState(currentUserReview);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [rating, setRating] = useState(userReview ? userReview.rating : 0);
  const [titleInput, setTitleInput] = useState(userReview ? userReview.title : "");
  const [reviewInput, setReviewInput] = useState(userReview ? userReview.review : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Open modal and pre-fill state based on current userReview
  const handleOpenModal = () => {
    if (!isAuthenticated) {
      onUnauthAction?.();
      return;
    }
    setRating(userReview ? userReview.rating : 0);
    setTitleInput(userReview ? userReview.title : "");
    setReviewInput(userReview ? userReview.review : "");
    setIsWriteModalOpen(true);
  };

  // Reload reviews list, average scores, and counts
  const refreshReviewsAndStats = async (currentSort = sort) => {
    try {
      const res = await fetch(`/api/reviews?page=1&limit=10&sort=${currentSort}&t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setTotalReviews(data.total);
        setAverageRating(data.averageRating);
        setHasMore(data.hasMore);
        setPage(1);
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || t("dashboard.reviews.errors.save"));
      }
    } catch (err) {
      console.error("Refresh error:", err);
      toast.error(t("dashboard.reviews.errors.saveUnexpected"));
    }
  };

  // Load more paginated reviews
  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/reviews?page=${nextPage}&limit=10&sort=${sort}&t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) => [...prev, ...data.reviews]);
        setHasMore(data.hasMore);
        setPage(nextPage);
      } else {
        toast.error(t("alerts.error"));
      }
    } catch (err) {
      toast.error(t("alerts.error"));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sort Change
  const handleSortChange = async (value) => {
    setSort(value);
    await refreshReviewsAndStats(value);
  };

  // Handle Form Submission (Create or Update)
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!rating || rating < 1 || rating > 5) {
      toast.error(t("dashboard.reviews.validation.rating"));
      return;
    }
    if (!titleInput.trim()) {
      toast.error(t("dashboard.reviews.validation.titleRequired"));
      return;
    }
    if (titleInput.length > 100) {
      toast.error(t("dashboard.reviews.validation.titleLength"));
      return;
    }
    if (!reviewInput.trim()) {
      toast.error(t("dashboard.reviews.validation.descriptionRequired"));
      return;
    }
    if (reviewInput.length > 500) {
      toast.error(t("dashboard.reviews.validation.descriptionLength"));
      return;
    }

    setIsSubmitting(true);
    const url = userReview ? `/api/reviews/${userReview.id}` : "/api/reviews";
    const method = userReview ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title: titleInput,
          review: reviewInput,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(userReview ? t("dashboard.reviews.success.updated") : t("dashboard.reviews.success.submitted"));
        setUserReview(data.review);
        setIsWriteModalOpen(false);
        await refreshReviewsAndStats();
      } else {
        toast.error(data.error || t("dashboard.reviews.errors.save"));
      }
    } catch (err) {
      toast.error(t("dashboard.reviews.errors.saveUnexpected"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Review
  const handleDeleteReview = async () => {
    if (!userReview || !confirm(t("dashboard.reviews.confirmDelete"))) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/reviews/${userReview.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(t("dashboard.reviews.success.deleted"));
        setUserReview(null);
        setIsWriteModalOpen(false);
        await refreshReviewsAndStats();
      } else {
        const data = await res.json();
        toast.error(data.error || t("dashboard.reviews.errors.delete"));
      }
    } catch (err) {
      toast.error(t("dashboard.reviews.errors.deleteUnexpected"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section id="reviews" className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background dynamic radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-500/5 dark:bg-indigo-500/3 rounded-full filter blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {t("landing.reviews.sectionTitle")}
          </h2>
          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {t("landing.reviews.title")}
          </p>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t("landing.reviews.subtitle")}
          </p>
        </div>

        {/* Rating Scorecard Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-card/40 border border-border/50 rounded-3xl p-8 backdrop-blur-md mb-12">
          {/* Average Rating Big View */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-2 md:border-r md:border-border/30 md:pr-8">
            <span className="text-5xl font-black tracking-tight text-foreground flex items-baseline">
              {averageRating}
              <span className="text-lg text-muted-foreground font-semibold ml-1">/ 5</span>
            </span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
              {t("landing.reviews.basedOn", {
                count: totalReviews,
                reviews: totalReviews === 1 ? t("landing.reviews.review") : t("landing.reviews.reviews")
              })}
            </p>
          </div>

          {/* Action Trigger Card */}
          <div className="md:col-span-7 flex flex-col sm:flex-row items-center justify-between gap-6 sm:pl-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-bold text-foreground">
                {userReview ? t("landing.reviews.sharedExperience") : t("landing.reviews.howIsJobHunt")}
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">
                {userReview
                  ? t("landing.reviews.manageFeedback")
                  : t("landing.reviews.submitFeedbackHelp")}
              </p>
            </div>
            <Button
              onClick={handleOpenModal}
              className="rounded-xl px-6 py-5 cursor-pointer bg-primary hover:bg-primary/95 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200"
            >
              {userReview ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  {t("landing.reviews.editMyReview")}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("landing.reviews.writeReview")}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/25">
          <span className="text-xs font-black uppercase tracking-wider text-muted-foreground/80">
            {t("landing.reviews.showingCount", { count: reviews.length, total: totalReviews })}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-muted-foreground hidden sm:inline">{t("landing.reviews.sort")}</span>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[160px] rounded-xl bg-card/60 border-border/50 text-xs font-semibold">
                <SelectValue placeholder={t("landing.reviews.sortBy")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="newest" className="text-xs font-medium cursor-pointer">
                  {t("landing.reviews.sortNewest")}
                </SelectItem>
                <SelectItem value="highest" className="text-xs font-medium cursor-pointer">
                  {t("landing.reviews.sortHighest")}
                </SelectItem>
                <SelectItem value="lowest" className="text-xs font-medium cursor-pointer">
                  {t("landing.reviews.sortLowest")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dynamic Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-card/25 border border-border/40 rounded-3xl backdrop-blur-sm">
            <Award className="w-12 h-12 text-muted-foreground/35 mx-auto mb-4" />
            <p className="text-sm font-semibold text-muted-foreground">
              {t("landing.reviews.emptyState")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
            {reviews.map((rev) => {
              const isOwner = userReview && rev.id === userReview.id;
              const formattedDate = new Date(rev.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              const authorInitials = `${rev.user?.firstName?.[0] || t("landing.reviews.defaultAuthor")[0]}${rev.user?.lastName?.[0] || ""}`;
              const authorName = `${rev.user?.firstName || t("landing.reviews.defaultAuthor")} ${rev.user?.lastName || ""}`.trim();

              return (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4 }}
                  className={`p-6 rounded-3xl border bg-card/45 hover:bg-card/75 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 hover:border-indigo-500/15 relative overflow-hidden group ${
                    isOwner ? "border-indigo-500/35 ring-1 ring-indigo-500/20" : "border-border/50"
                  }`}
                >
                  {isOwner && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                      {t("landing.reviews.yourReviewLabel")}
                    </div>
                  )}

                  <div className="space-y-3.5">
                    {/* Stars & Date row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/20"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/80">
                        {formattedDate}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-foreground tracking-tight leading-snug">
                        {rev.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {rev.review}
                      </p>
                    </div>
                  </div>

                  {/* Author Information footer */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border/10">
                    <Avatar className="h-9 w-9 border border-border">
                      {rev.user?.imageUrl && (
                        <AvatarImage src={rev.user.imageUrl} alt={authorName} />
                      )}
                      <AvatarFallback className="bg-secondary text-foreground text-xs font-bold">
                        {authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-foreground truncate max-w-[150px]">
                        {authorName}
                      </h5>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[150px] font-semibold mt-0.5">
                        {rev.user?.targetRole || t("landing.reviews.anonymousCandidate")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="rounded-xl px-8 py-5 border-border/50 text-xs font-bold cursor-pointer hover:bg-secondary/40 transition-colors"
            >
              {isLoading ? t("landing.reviews.loading") : t("landing.reviews.loadMore")}
            </Button>
          </div>
        )}
      </div>

      {/* Write/Edit Review Modal Dialog */}
      <Dialog open={isWriteModalOpen} onOpenChange={setIsWriteModalOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              {userReview ? t("landing.reviews.editMyReview") : t("landing.reviews.writeReview")}
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-muted-foreground">
              {userReview
                ? t("landing.reviews.modal.editDescription")
                : t("landing.reviews.modal.newDescription")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitReview} className="space-y-5 pt-3">
            {/* Star selector */}
            <div className="flex items-center space-x-1">
              <span className="text-xs font-extrabold text-muted-foreground mr-2">{t("dashboard.reviews.yourRating")}</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 transition-colors duration-150 ${
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/35 fill-transparent hover:text-yellow-400/80"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Title field */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-xs font-extrabold text-foreground">
                {t("dashboard.reviews.reviewTitle")}
              </label>
              <input
                id="title"
                type="text"
                placeholder={t("landing.reviews.form.titlePlaceholder")}
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                maxLength={100}
                required
                className="w-full p-3 rounded-xl border border-border/50 bg-background/50 text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all duration-200"
              />
            </div>

            {/* Review description field */}
            <div className="space-y-2">
              <label htmlFor="review" className="text-xs font-extrabold text-foreground">
                {t("dashboard.reviews.reviewDetails")}
              </label>
              <textarea
                id="review"
                placeholder={t("landing.reviews.form.detailsPlaceholder")}
                value={reviewInput}
                onChange={(e) => setReviewInput(e.target.value)}
                maxLength={500}
                required
                className="w-full min-h-[120px] p-3 rounded-xl border border-border/50 bg-background/50 text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all duration-200 resize-none"
              />
              <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                <span>{t("dashboard.reviews.maxCharacters")}</span>
                <span>{t("landing.reviews.form.descLength", { count: reviewInput.length })}</span>
              </div>
            </div>

            {/* Submit / Cancel / Delete controls */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/20">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="rounded-xl text-xs font-bold cursor-pointer"
                >
                  {t("dashboard.reviews.cancel")}
                </Button>

                {userReview && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleDeleteReview}
                    disabled={isDeleting}
                    className="rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    {isDeleting ? t("landing.reviews.modal.deleting") : t("landing.reviews.modal.delete")}
                  </Button>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl px-5 cursor-pointer bg-primary hover:bg-primary/95 text-xs font-bold transition-all"
              >
                {isSubmitting ? t("dashboard.reviews.saving") : userReview ? t("landing.reviews.form.updateReview") : t("landing.reviews.form.submitReview")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
