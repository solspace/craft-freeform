export type Notice = {
  id: number;
  message: string;
  type: 'new' | 'info' | 'warning' | 'error';
  dateCreated: string;
};
