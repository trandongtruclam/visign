import { create } from "zustand";

type FeedbackModalStore = {
  isOpen: boolean;
  feedback: string;
  loading: boolean;
  open: (feedback: string, loading?: boolean) => void;
  close: () => void;
  setFeedback: (feedback: string) => void;
  setLoading: (loading: boolean) => void;
};

export const useFeedbackModal = create<FeedbackModalStore>((set) => ({
  isOpen: false,
  feedback: "",
  loading: false,
  open: (feedback, loading = false) =>
    set({ isOpen: true, feedback, loading }),
  close: () => set({ isOpen: false, feedback: "", loading: false }),
  setFeedback: (feedback) => set({ feedback, loading: false }),
  setLoading: (loading) => set({ loading }),
}));

