import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, AlertTriangle } from "lucide-react";
import { useGrados } from "../../../../hooks/useGrados";
import { toast } from "sonner";

const ModalEliminarGrado = ({ isOpen, onClose, grado }) => {
  const { deleteGrado, isDeleting } = useGrados();

  const handleDelete = () => {
    const id = grado?.idGrado || grado?.id;
    deleteGrado(id, {
      onSuccess: () => {
        toast.success("Grado eliminado exitosamente");
        onClose();
      },
      onError: (error) => {
        toast.error("Error al eliminar grado", {
          description: error.message,
        });
      },
    });
  };

  if (!grado) return null;

  const nombreGrado = grado.nombre || grado.grado || "Sin nombre";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Eliminar Grado
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="p-3 bg-red-100 rounded-full">
                      <AlertTriangle className="w-12 h-12 text-red-600" />
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-700 mb-2">
                      ¿Estás seguro de que deseas eliminar este grado?
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 text-left">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Grado:</span>{" "}
                        {nombreGrado}
                      </p>
                    </div>
                    <p className="text-sm text-red-600 mt-3">
                      Esta acción no se puede deshacer
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModalEliminarGrado;
