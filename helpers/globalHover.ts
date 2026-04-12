export let currentHoveredTransactionId: string | null = null;
export let currentHoveredStudentId: string | null = null;

export const setHoveredTransaction = (id: string | null) => {
  currentHoveredTransactionId = id;
};

export const setHoveredStudent = (id: string | null) => {
  currentHoveredStudentId = id;
};
